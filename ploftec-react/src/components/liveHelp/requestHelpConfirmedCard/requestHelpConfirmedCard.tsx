"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button, AvatarUser, Loading } from "@/components";
import type { RequestHelpConfirmedResponse, RequestHelpResponse } from "@/lib/types/forum";
import { parseApiUtc } from "@/lib/utils/datetime";
import { Trophy, LogIn, Clock } from "lucide-react";
import styles from "../requestHelpCard/requestHelpCard.module.css";
import useLiveHelpStore from "@/store/slices/liveHelpStore/liveHelpStore";

type Props = {
  item: RequestHelpConfirmedResponse;
};

function formatCountdown(ms: number) {
  if (ms <= 0) return "Ya comenzó";
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
  const hours = ms / (1000 * 60 * 60);
  if (hours <= 1) return "danger";
  if (hours <= 6) return "warn";
  return "ok";
}

function mapToRequestHelpResponse(item: RequestHelpConfirmedResponse): RequestHelpResponse {
  return {
    userCreator: item.userCreator,
    CodeRequestHelp: item.codeRequestHelp,
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
}

export function RequestHelpConfirmedCard({ item }: Props) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const [navLoading, setNavLoading] = useState(false);

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

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = initInfo.valid ? Math.max(0, initInfo.ms - now) : 0;
  const countdownText = initInfo.valid ? formatCountdown(remainingMs) : "Inicio sin definir";
  const urgency = initInfo.valid ? variantByMs(remainingMs) : "warn";
  const initLabel = initInfo.label ?? "Sin horario disponible";
  const countdownAccentClass =
    styles[`countdown${urgency.charAt(0).toUpperCase()}${urgency.slice(1)}`] ?? "";

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

  function openDetail() {
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
        onClick={openDetail}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDetail();
          }
        }}
      >
        <div className={styles.topRow}>
          <AvatarUser
            tagUser={item.userCreator?.initials ?? "?"}
            imageUser={item.userCreator?.image}
            descripcionCorta={item.userCreator?.shortDescription ?? ""}
            descripcionLarga={item.userCreator?.longDescription ?? ""}
            nombreCompleto={item.userCreator?.completeName ?? ""}
            direction="right"
          />
          <div className={styles.rightPanel}>
            <div className={styles.timerAndReward}>
              <div className={styles.rewardBadge}>
                <Trophy size={16} className={styles.trophy} />
                <span className={styles.regard}>{item.regard.toFixed(2)}</span>
              </div>
            </div>
            <div
              className={styles.helpButtonWrap}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Button
                onClick={openDetail}
                icon={<LogIn />}
                circular
                ariaLabel="Ir al detalle de la ayuda"
                title="Ir al detalle"
              />
            </div>
          </div>
        </div>

        <div className={styles.initRow}>
          <div className={`${styles.initCountdown} ${countdownAccentClass}`}>
            <Clock size={16} />
            <span>{countdownText}</span>
          </div>
          <div className={styles.initMeta}>
            Inicio programado: {initLabel}
            {confirmedLabel && <> · Confirmada el {confirmedLabel}</>}
          </div>
          <div
            className={`${styles.statusPill} ${item.isOwner ? styles.ownerPill : ""}`}
          >
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
    </>
  );
}
