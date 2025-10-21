"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { requestHelpService } from "@/lib/services/forum/requestHelpService";
import type { LiveHelpSessionResponse } from "@/lib/types/forum";
import useAuthStore from "@/store/slices/authStore/authStore";

type ViewState = "loading" | "joining" | "ready";

type JoinPayload = {
  codeSession: string;
  userId?: string;
};

type JaasScriptRef = {
  src: string;
  promise: Promise<void>;
};

type JitsiMeetOptions = {
  roomName: string;
  jwt?: string;
  parentNode: HTMLElement;
  configOverwrite?: Record<string, unknown>;
  interfaceConfigOverwrite?: Record<string, unknown>;
  userInfo?: Record<string, unknown>;
};

type JitsiExternalAPI = {
  addEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
  removeEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
  executeCommand: (command: string, ...args: unknown[]) => void;
  dispose: () => void;
};

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: JitsiMeetOptions) => JitsiExternalAPI;
  }
}

const DEFAULT_SERVER_URL = "https://8x8.vc";
let jaasScript: JaasScriptRef | null = null;

export default function LiveHelpMeetingPage() {
  const params = useParams<{ sessionId: string }>();
  const searchParams = useSearchParams();
  const sessionId = params?.sessionId ?? "";

  const authUser = useAuthStore((state) => state.user);
  const userId = authUser?.email ?? authUser?.userName ?? undefined;
  const displayName = authUser?.userName ?? authUser?.email ?? "Invitado";

  const [session, setSession] = useState<LiveHelpSessionResponse | null>(null);
  const [state, setState] = useState<ViewState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<JitsiExternalAPI | null>(null);
  const hasJoinedRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const storedSession = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.sessionStorage.getItem("livehelp:session");
      return raw ? (JSON.parse(raw) as LiveHelpSessionResponse) : null;
    } catch {
      return null;
    }
  }, []);

  const persistSession = useCallback((data: LiveHelpSessionResponse) => {
    if (typeof window !== "undefined") {
      try {
        window.sessionStorage.setItem("livehelp:session", JSON.stringify(data));
      } catch {
        // ignore storage errors
      }
    }
  }, []);

  useEffect(() => {
    let active = true;
    const codeRequestHelp = searchParams?.get("codeRequestHelp");

    async function hydrate() {
      if (storedSession && storedSession.codeSession === sessionId) {
        hasJoinedRef.current = false;
        setExpired(false);
        setSession(storedSession);
        setState("joining");
        return;
      }
      if (!codeRequestHelp) {
        setError("No encontramos la información de la reunión.");
        setState("loading");
        return;
      }
      try {
        const res = await requestHelpService.getLiveHelpSession(Number(codeRequestHelp));
        const data = res?.data;
        if (!data || data.codeSession !== sessionId) {
          setError("La sesión solicitada no está disponible.");
        } else {
          persistSession(data);
          if (active) {
            hasJoinedRef.current = false;
            setExpired(false);
            setSession(data);
            setState("joining");
          }
        }
      } catch (err) {
        console.error("get session failed", err);
        if (active) {
          setError("No pudimos recuperar la reunión. Intenta nuevamente.");
          setState("loading");
        }
      }
    }

    hydrate();
    return () => {
      active = false;
    };
  }, [searchParams, sessionId, storedSession, persistSession]);

  const scheduleExpiry = useCallback(
    (expiresIso?: string) => {
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = null;
      }
      if (!expiresIso) return;
      const expiresAt = new Date(expiresIso);
      const ms = expiresAt.getTime() - Date.now();
      if (!Number.isFinite(ms)) return;
      if (ms <= 0) {
        setExpired(true);
        return;
      }
      expiryTimerRef.current = setTimeout(() => {
        setExpired(true);
      }, ms);
    },
    []
  );

  useEffect(() => {
    if (!session?.expiresAt) return;
    const expiresIso =
      session.expiresAt instanceof Date ? session.expiresAt.toISOString() : session.expiresAt;
    scheduleExpiry(expiresIso);
  }, [session?.expiresAt, scheduleExpiry]);

  useEffect(() => {
    if (!session || error || expired || hasJoinedRef.current) return;
    let cancelled = false;

    async function joinConference() {
      try {
        setState("joining");
        setError(null);
        const payload: JoinPayload = { codeSession: session.codeSession, userId };
        const res = await requestHelpService.enterLiveHelpSession(payload);
        const data = res?.data;
        if (!data) {
          throw new Error("IngresarSesion devolvió un payload vacío");
        }
        const merged = { ...session, ...data };
        persistSession(merged);
        if (cancelled) return;
        setSession(merged);

        if (!merged.appId || !merged.room || !merged.jwt) {
          throw new Error("La sesión no contiene la información necesaria para iniciar JaaS.");
        }

        await loadJaasScript(
          `${(merged.serverUrl ?? DEFAULT_SERVER_URL).replace(/\/$/, "")}/${merged.appId}/external_api.js`
        );
        if (cancelled) return;
        if (!window.JitsiMeetExternalAPI) {
          throw new Error("JitsiMeetExternalAPI no disponible");
        }
        if (!containerRef.current) {
          throw new Error("Contenedor de Jitsi no encontrado");
        }

        if (apiRef.current) {
          try {
            apiRef.current.dispose();
          } catch {
            // ignore
          }
        }

        const serverUrl = merged.serverUrl ?? DEFAULT_SERVER_URL;
        let domain: string;
        try {
          domain = new URL(serverUrl).hostname;
        } catch {
          domain = serverUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
        }
        const roomName = merged.room ?? merged.roomName;

        const api = new window.JitsiMeetExternalAPI(domain, {
          roomName,
          parentNode: containerRef.current,
          jwt: merged.jwt,
          userInfo: {
            displayName: merged.ui?.displayName ?? displayName,
            email: authUser?.email,
          },
          configOverwrite: {
            prejoinConfig: {
              enabled: false,
            },
            disableDeepLinking: true,
            startWithAudioMuted: merged.ui?.startWithAudioMuted ?? false,
            startWithVideoMuted: merged.ui?.startWithVideoMuted ?? false,
            requireDisplayName: false,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_BRAND_WATERMARK: false,
            SHOW_POWERED_BY: false,
            HIDE_DEEP_LINKING_LOGO: true,
          },
        });

        apiRef.current = api;
        hasJoinedRef.current = true;

        const handleJoined = () => setState("ready");
        const handleReadyToClose = () => setExpired(true);

        api.addEventListener("videoConferenceJoined", handleJoined);
        api.addEventListener("readyToClose", handleReadyToClose);

        if (closeTimerRef.current) {
          clearTimeout(closeTimerRef.current);
        }
        const closeIso = merged.shouldCloseAt ?? merged.expiresAt;
        if (closeIso) {
          const closeMs = new Date(closeIso).getTime() - Date.now();
          if (Number.isFinite(closeMs) && closeMs > 0) {
            closeTimerRef.current = setTimeout(() => {
              if (apiRef.current) {
                apiRef.current.executeCommand("hangup");
              }
              setExpired(true);
              closeTimerRef.current = null;
            }, closeMs);
          }
        }

        const expiresIso =
          merged.expiresAt instanceof Date ? merged.expiresAt.toISOString() : merged.expiresAt;
        scheduleExpiry(expiresIso);
      } catch (err) {
        console.error("enter session failed", err);
        if (!cancelled) {
          hasJoinedRef.current = false;
          setError("No existe la reunión o no tenés permisos para ingresar.");
          setState("loading");
        }
      }
    }

    joinConference();

    return () => {
      cancelled = true;
    };
  }, [session, error, expired, displayName, authUser?.email, userId, persistSession, scheduleExpiry]);

  useEffect(() => {
    return () => {
      if (apiRef.current) {
        try {
          apiRef.current.dispose();
        } catch {
          // ignore
        }
        apiRef.current = null;
      }
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = null;
      }
      hasJoinedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!expired) return;
    if (apiRef.current) {
      try {
        apiRef.current.executeCommand("hangup");
      } catch {
        // ignore
      }
      try {
        apiRef.current.dispose();
      } catch {
        // ignore
      }
      apiRef.current = null;
    }
  }, [expired]);

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>La sesión expiró. Inicia una nueva reunión para continuar.</p>
        </div>
      </div>
    );
  }

  const subtitle = session
    ? `Room: ${session.room ?? session.roomName}`
    : `Room: ${sessionId}`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Videollamada en vivo</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      <div className={styles.videoWrapper}>
        <div id="jaas-container" ref={containerRef} style={{ width: "100%" }} />
        {state !== "ready" && (
          <div className={styles.loadingOverlay}>
            <span>{state === "loading" ? "Preparando tu sala…" : "Conectando…"}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function loadJaasScript(src: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.JitsiMeetExternalAPI) return Promise.resolve();

  if (jaasScript && jaasScript.src === src) {
    return jaasScript.promise;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("No pude cargar JaaS")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("No pude cargar JaaS"));
    document.body.appendChild(script);
  });

  jaasScript = { src, promise };
  return promise;
}
