"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import styles from "./page.module.css";
import { requestHelpService } from "@/lib/services/forum/requestHelpService";
import type { LiveHelpSessionResponse } from "@/lib/types/forum";
import useAuthStore from "@/store/slices/authStore/authStore";

const DEFAULT_JITSI_DOMAIN = process.env.NEXT_PUBLIC_JITSI_DOMAIN ?? "meet.jit.si";

export default function LiveHelpMeetingPage() {
  const params = useParams<{ sessionId: string }>();
  const searchParams = useSearchParams();
  const sessionId = params?.sessionId ?? "";
  const authUser = useAuthStore((state) => state.user);
  const displayName = authUser?.userName ?? authUser?.email ?? "Invitado";

  const [session, setSession] = useState<LiveHelpSessionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expired, setExpired] = useState(false);
  const hasJoinedRef = useRef(false);
  const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);

  const storedSession = useMemo(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.sessionStorage.getItem("livehelp:session");
      return raw ? (JSON.parse(raw) as LiveHelpSessionResponse) : null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    const codeRequestHelp = searchParams?.get("codeRequestHelp");

    async function hydrateSession() {
      if (storedSession && storedSession.codeSession === sessionId) {
        setSession(storedSession);
        setLoading(false);
        return;
      }
      if (!codeRequestHelp) {
        setError("No encontramos la información de la reunión.");
        setLoading(false);
        return;
      }
      try {
        const res = await requestHelpService.getLiveHelpSession(Number(codeRequestHelp));
        const data = res?.data;
        if (!data || data.codeSession !== sessionId) {
          setError("La sesión solicitada no está disponible.");
        } else {
          if (typeof window !== "undefined") {
            try {
              window.sessionStorage.setItem("livehelp:session", JSON.stringify(data));
              window.sessionStorage.setItem("livehelp:lastRequest", String(codeRequestHelp));
            } catch {}
          }
          if (active) setSession(data);
        }
      } catch (err) {
        console.error("get session failed", err);
        if (active) setError("No pudimos recuperar la reunión. Intenta nuevamente.");
      } finally {
        if (active) setLoading(false);
      }
    }

    hydrateSession();
    return () => {
      active = false;
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = null;
      }
    };
  }, [searchParams, sessionId, storedSession]);

  useEffect(() => {
    if (!session || error || hasJoinedRef.current) return;
    let cancelled = false;

    async function enter() {
      try {
        setEntering(true);
        const res = await requestHelpService.enterLiveHelpSession(session.codeSession);
        const sessionData = res?.data;
        if (!sessionData) {
          throw new Error("Session data missing");
        }
        if (cancelled) return;
        hasJoinedRef.current = true;
        const merged = { ...session, ...sessionData };
        setSession(merged);
        if (typeof window !== "undefined") {
          try {
            window.sessionStorage.setItem("livehelp:session", JSON.stringify(merged));
          } catch {}
        }
      } catch (err) {
        console.error("enter session failed", err);
        if (!cancelled) {
          setError("No existe la reunión o no tenés permisos para ingresar.");
        }
      } finally {
        if (!cancelled) setEntering(false);
      }
    }

    enter();

    return () => {
      cancelled = true;
    };
  }, [session, error]);

  useEffect(() => {
    if (!session) return;
    if (expiryTimerRef.current) {
      clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
    const expiresAt = new Date(session.expiresAt ?? session.initAt ?? Date.now());
    const ms = expiresAt.getTime() - Date.now();
    if (Number.isFinite(ms) && ms > 0) {
      expiryTimerRef.current = setTimeout(() => {
        setExpired(true);
      }, ms);
    } else if (ms <= 0) {
      setExpired(true);
    }
    return () => {
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
        expiryTimerRef.current = null;
      }
    };
  }, [session?.expiresAt, session?.initAt]);

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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Videollamada en vivo</h1>
        <p className={styles.subtitle}>
          Room: {session?.roomName ?? sessionId}
        </p>
      </div>
      <div className={styles.videoWrapper}>
        {loading || entering || !session ? (
          <div className={styles.loadingState}>
            <span>Preparando tu sala…</span>
          </div>
        ) : (
          <iframe
            src={buildJitsiUrl(session.roomName, displayName)}
            allow="camera; microphone; fullscreen; speaker; display-capture"
            allowFullScreen
            className={styles.iframe}
            title="Videollamada Live Help"
          />
        )}
      </div>
    </div>
  );
}

function buildJitsiUrl(roomName: string, displayName: string) {
  const base = DEFAULT_JITSI_DOMAIN.startsWith("http")
    ? DEFAULT_JITSI_DOMAIN
    : `https://${DEFAULT_JITSI_DOMAIN}`;

  const params = [
    ["config.prejoinConfig.enabled", "false"],
    ["config.requireDisplayName", "false"],
    ["config.disableDeepLinking", "true"],
    ["config.startWithAudioMuted", "false"],
    ["config.startWithVideoMuted", "false"],
    ["config.notifications.enabled", "true"],
    ["interfaceConfig.SHOW_JITSI_WATERMARK", "false"],
    ["interfaceConfig.SHOW_BRAND_WATERMARK", "false"],
    ["interfaceConfig.SHOW_POWERED_BY", "false"],
    ["interfaceConfig.HIDE_DEEP_LINKING_LOGO", "true"],
    ["userInfo.displayName", displayName],
  ];

  const hash = params
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");

  return `${base}/${encodeURIComponent(roomName)}#${hash}`;
}
