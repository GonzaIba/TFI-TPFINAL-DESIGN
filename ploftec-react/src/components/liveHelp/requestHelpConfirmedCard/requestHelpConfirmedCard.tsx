"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button, AvatarUser, Loading, ModalComponent } from "@/components";
import { useOpenForumUserDetail } from "@/hooks";
import type { RequestHelpConfirmedResponse, RequestHelpResponse, TermsConditionsResponse } from "@/lib/types/forum";
import { parseApiUtc } from "@/lib/utils/datetime";
import { Trophy, LogIn, Clock, Play } from "lucide-react";
import styles from "../requestHelpCard/requestHelpCard.module.css";
import useLiveHelpStore from "@/store/slices/liveHelpStore/liveHelpStore";
import { requestHelpService } from "@/lib/services/forum/requestHelpService";

type Props = {
  item: RequestHelpConfirmedResponse;
};

function formatCountdown(ms: number) {
  if (ms <= 0) return "Ya comenzó";
  if (ms < 60_000) {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    return `Inicia en ${seconds}s`;
  }

  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return `Inicia en ${parts.join(" ")}`;
}

function variantByMs(ms: number) {
  if (ms <= 0) return "danger";
  if (ms <= 60_000) return "critical";
  const hours = ms / (1000 * 60 * 60);
  if (hours <= 1) return "danger";
  if (hours <= 6) return "warn";
  return "ok";
}

function mapToRequestHelpResponse(item: RequestHelpConfirmedResponse): RequestHelpResponse {
  const mapped: RequestHelpResponse = {
    userCreator: item.userCreator,
    codeRequestHelp: item.codeRequestHelp,
    titleHelp: item.titleHelp,
    message: item.message,
    status: item.status,
    languages: item.languages,
    labels: item.labels,
    createdAt: item.createdAt as any,
    regard: item.regard,
    expiresAt: item.initAt as any,
    timeSlot: undefined,
  };
  (mapped as any).CodeRequestHelp = item.codeRequestHelp;
  return mapped;
}

export function RequestHelpConfirmedCard({ item }: Props) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const [navLoading, setNavLoading] = useState(false);
  const openForumUserDetail = useOpenForumUserDetail();
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsLoading, setTermsLoading] = useState(false);
  const [termsError, setTermsError] = useState<string | null>(null);
  const [termsData, setTermsData] = useState<TermsConditionsResponse | null>(null);
  const [acceptingTerms, setAcceptingTerms] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const initInfo = useMemo(() => {
    let parsed: Date;
    try {
      parsed = parseApiUtc(item.initAt as any);
    } catch {
      parsed = new Date(item.initAt);
    }
    const ms = parsed.getTime();
    const valid = Number.isFinite(ms);
    let label: string | null = null;
    if (valid) {
      try {
        label = new Intl.DateTimeFormat(undefined, {
          weekday: "short",
          hour: "2-digit",
          minute: "2-digit",
        }).format(parsed);
      } catch {
        label = parsed.toLocaleString();
      }
    }
    return { parsed, ms, valid, label };
  }, [item.initAt]);

  const confirmedLabel = useMemo(() => {
    try {
      const parsed = parseApiUtc(item.createdAt as any);
      const ms = parsed.getTime();
      if (!Number.isFinite(ms)) return null;
      return new Intl.DateTimeFormat(undefined, {
        day: "2-digit",
        month: "short",
      }).format(parsed);
    } catch {
      return null;
    }
  }, [item.createdAt]);

  const remainingMs = useMemo(() => {
    if (!initInfo.valid) return 0;
    return Math.max(0, initInfo.ms - now);
  }, [initInfo.ms, initInfo.valid, now]);

  useEffect(() => {
    if (!initInfo.valid) return;
    if (remainingMs === 0) return;

    const delay = remainingMs <= 60_000 ? 1000 : 60_000;
    const id = window.setTimeout(() => setNow(Date.now()), delay);
    return () => clearTimeout(id);
  }, [initInfo.valid, remainingMs]);

  const showSecondsCountdown = initInfo.valid && remainingMs > 0 && remainingMs <= 60_000;
  const countdownText = initInfo.valid ? formatCountdown(remainingMs) : "Inicio sin definir";
  const urgency = initInfo.valid ? variantByMs(remainingMs) : "warn";
  const isLive = initInfo.valid && initInfo.ms <= now;
  const countdownAccentClass =
    styles[`countdown${urgency.charAt(0).toUpperCase()}${urgency.slice(1)}`] ?? "";
  const countdownClassName = [
    styles.initCountdown,
    countdownAccentClass,
    showSecondsCountdown ? styles.countdownSeconds : "",
  ]
    .filter(Boolean)
    .join(" ");
  const secondsPulseAnimation = showSecondsCountdown ? { scale: [1, 1.08, 1] } : { scale: 1 };
  const secondsPulseTransition = showSecondsCountdown
    ? { duration: 1, repeat: Infinity, ease: "easeInOut" as const }
    : { duration: 0.2, ease: "easeOut" as const };

  const goToDetail = useCallback(() => {
    const id = item.codeRequestHelp;
    try {
      const mapped = mapToRequestHelpResponse(item);
      useLiveHelpStore.getState().setSelected(mapped);
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem("livehelp:selected", JSON.stringify(mapped));
      }
    } catch {}
    setNavLoading(true);
    setTimeout(() => {
      router.push(`/forum/liveHelp/detail/${encodeURIComponent(String(id))}`);
    }, 550);
  }, [item, router]);

  const metaLine = useMemo(() => {
    const segments: string[] = [];
    segments.push(initInfo.label ?? "Horario por confirmar");
    if (confirmedLabel) segments.push(`Confirmada el ${confirmedLabel}`);
    return segments.join(" · ");
  }, [initInfo.label, confirmedLabel]);

  const termsParagraphs = useMemo(() => {
    if (!termsData?.contenido) return [];
    return termsData.contenido.split(/\r?\n+/).filter((line) => line.trim().length > 0);
  }, [termsData]);

  const fetchTermsConditions = useCallback(async () => {
    setTermsLoading(true);
    setTermsError(null);
    try {
      const res = await requestHelpService.getTermsConditions();
      if (!res.data) {
        throw new Error("empty response");
      }
      setTermsData(res.data);
    } catch (error) {
      console.error("get terms conditions failed", error);
      setTermsError("No pude cargar los términos y condiciones. Intenta nuevamente.");
    } finally {
      setTermsLoading(false);
    }
  }, []);

  const handleCardActivate = useCallback(() => {
    if (isLive) {
      setAcceptError(null);
      setTermsModalOpen(true);
      if (!termsData && !termsLoading) {
        fetchTermsConditions();
      }
    } else {
      goToDetail();
    }
  }, [isLive, goToDetail, termsData, termsLoading, fetchTermsConditions]);

  const handleAcceptTerms = useCallback(async () => {
    setAcceptError(null);
    setAcceptingTerms(true);
    try {
      const res = await requestHelpService.acceptTermsConditions(item.codeRequestHelp);
      const successFlag = (res?.data as any)?.success;
      if (successFlag === false) {
        setAcceptError("Necesitamos tu aceptación para continuar con la videollamada.");
        return;
      }

      const sessionRes = await requestHelpService.getLiveHelpSession(item.codeRequestHelp);
      const session = sessionRes?.data;
      if (!session) {
        setAcceptError("No pude obtener los datos de la sesión. Intenta nuevamente.");
        return;
      }

      if (typeof window !== "undefined") {
        try {
          window.sessionStorage.setItem("livehelp:session", JSON.stringify(session));
          window.sessionStorage.setItem("livehelp:lastRequest", String(item.codeRequestHelp));
        } catch {}
      }

      setTermsModalOpen(false);

      const normalizedDomain = session.domain?.replace(/^\/+/, "") ?? "";
      const basePath = `/forum/${normalizedDomain}`;
      const separator = basePath.includes("?") ? "&" : "?";
      const target = `${basePath}${separator}codeRequestHelp=${encodeURIComponent(String(item.codeRequestHelp))}`;
      router.push(target);
    } catch (error) {
      console.error("accept terms failed", error);
      setAcceptError("Algo salió mal procesando tu acceso. Intenta nuevamente.");
    } finally {
      setAcceptingTerms(false);
    }
  }, [item.codeRequestHelp, router]);

  const handleRetryTerms = useCallback(() => {
    if (!termsLoading) {
      fetchTermsConditions();
    }
  }, [fetchTermsConditions, termsLoading]);

  const tiltX = useSpring(0, { stiffness: 260, damping: 20, mass: 0.6 });
  const tiltY = useSpring(0, { stiffness: 260, damping: 20, mass: 0.6 });
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const glow = useMotionTemplate`radial-gradient(600px 200px at ${glowX}px ${glowY}px, rgba(127,90,240,0.12), transparent 60%)`;
  const bg = useMotionTemplate`${glow}, #151515`;

  function onMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x / rect.width - 0.5;
    const dy = y / rect.height - 0.5;
    tiltX.set(-(dy * 12));
    tiltY.set(dx * 12);
    glowX.set(x);
    glowY.set(y);
  }

  function onMouseLeave() {
    tiltX.set(0);
    tiltY.set(0);
  }

  return (
    <>
      <Loading show={navLoading} />
      <motion.article
        className={styles.card}
        initial={{ opacity: 0, y: 8, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 220, damping: 20 }}
        style={{
          rotateX: tiltX,
          rotateY: tiltY,
          transformPerspective: 900,
          background: bg as any,
          ["--px" as any]: glowX,
          ["--py" as any]: glowY,
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onClick={handleCardActivate}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardActivate();
          }
        }}
      >
        {isLive && (
          <div
            className={styles.liveOverlay}
            role="presentation"
            onClick={(event) => {
              event.stopPropagation();
              handleCardActivate();
            }}
          >
            <button
              type="button"
              className={styles.liveButton}
              onClick={(event) => {
                event.stopPropagation();
                handleCardActivate();
              }}
              aria-label="Ingresar a la reunión en vivo"
            >
              <Play size={32} />
            </button>
          <span className={styles.liveLabel}>En vivo</span>
        </div>
      )}
      <div className={styles.confirmedHeader}>
        <div className={styles.confirmedHeaderLeft}>
          <div
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          >
            <AvatarUser
              tagUser={item.userCreator?.initials ?? "?"}
              imageUser={item.userCreator?.image}
              descripcionCorta={item.userCreator?.shortDescription ?? ""}
              descripcionLarga={item.userCreator?.longDescription ?? ""}
              nombreCompleto={item.userCreator?.completeName ?? ""}
              direction="right"
              onClick={() => openForumUserDetail(item.userCreator?.email)}
            />
          </div>
          <div className={countdownClassName}>
            {showSecondsCountdown ? (
              <motion.span
                className={styles.urgentClock}
                aria-hidden
                animate={secondsPulseAnimation}
                transition={secondsPulseTransition}
              >
                <span className={styles.urgentClockHandMinute} />
                <span className={styles.urgentClockHandSecond} />
              </motion.span>
            ) : (
              <Clock size={16} />
            )}
            <motion.span
              className={showSecondsCountdown ? styles.countdownSecondsText : undefined}
              animate={secondsPulseAnimation}
              transition={secondsPulseTransition}
            >
              {countdownText}
            </motion.span>
          </div>
        </div>
        <div className={styles.confirmedHeaderRight}>
          <div className={styles.rewardBadge}>
            <Trophy size={16} className={styles.trophy} />
            <span className={styles.regard}>{item.regard.toFixed(2)}</span>
          </div>
          <div
            className={styles.helpButtonWrap}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Button
              onClick={handleCardActivate}
              icon={<LogIn />}
              circular
              ariaLabel="Ir al detalle de la ayuda"
              title="Ir al detalle"
            />
          </div>
        </div>
      </div>

        <div className={styles.confirmedBody}>
          <h3 className={styles.confirmedTitle} title={item.titleHelp}>
            {item.titleHelp}
          </h3>
          <div className={styles.confirmedMeta}>{metaLine}</div>
          <div className={`${styles.statusPill} ${item.isOwner ? styles.ownerPill : ""}`}>
            {item.isOwner ? "Soy el solicitante" : "Voy a ayudar"}
          </div>
        </div>

        <div className={styles.tagsRow}>
          <div className={styles.langRow}>
            {(item.languages ?? []).map((lang) => (
              <span key={lang} className={styles.langChip}>
                {lang}
              </span>
            ))}
          </div>
          <div className={styles.tagRow}>
            {(item.labels ?? []).map((label) => (
              <span key={label} className={styles.tagChip}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </motion.article>
      <ModalComponent
        open={termsModalOpen}
        onClose={() => {
          if (!acceptingTerms) {
            setTermsModalOpen(false);
          }
        }}
        closeIcon={false}
        styles={{ maxWidth: "900px" }}
      >
        <div className={styles.termsModal}>
          <h3 className={styles.termsTitle}>
            {termsData?.titulo ?? "Términos y Condiciones"}
          </h3>
          <div className={styles.termsBody}>
            {termsLoading ? (
              <div className={styles.termsLoading}>Cargando términos…</div>
            ) : termsError ? (
              <div className={styles.termsError}>
                <p>{termsError}</p>
                <Button
                  onClick={handleRetryTerms}
                  text="Reintentar"
                  width="140px"
                  disabled={acceptingTerms}
                />
              </div>
            ) : termsData ? (
              termsParagraphs.map((paragraph, idx) => (
                <p key={`terms-${idx}`}>{paragraph}</p>
              ))
            ) : (
              <div className={styles.termsLoading}>No encontré términos. Intenta nuevamente.</div>
            )}
          </div>
          {acceptError && <div className={styles.termsError}>{acceptError}</div>}
          <div className={styles.termsActions}>
            <Button
              onClick={() => {
                if (!acceptingTerms) setTermsModalOpen(false);
              }}
              text="Cancelar"
              transparent
              width="120px"
              disabled={acceptingTerms}
            />
            <Button
              onClick={handleAcceptTerms}
              text="Aceptar"
              width="140px"
              disabled={acceptingTerms || termsLoading || !!termsError || !termsData}
              loading={acceptingTerms}
            />
          </div>
        </div>
      </ModalComponent>
    </>
  );
}
