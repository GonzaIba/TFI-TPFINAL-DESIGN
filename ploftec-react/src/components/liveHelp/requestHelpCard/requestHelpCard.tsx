// src/components/liveHelp/requestHelpCard/requestHelpCard.tsx
"use client";

import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";
import { useRouter, useSearchParams } from 'next/navigation';
import styles from "./requestHelpCard.module.css";
import { Button, ExpiryTimer, AvatarUser, Loading } from "@/components";
import type { RequestHelpResponse } from "@/lib/types/forum";
import { useEffect, useMemo, useState } from "react";
import { Trophy } from "lucide-react";
import HandshakeIcon from '@mui/icons-material/Handshake';
import { parseApiUtc, formatLocalSlot } from '@/lib/utils/datetime';
import useLiveHelpStore from '@/store/slices/liveHelpStore/liveHelpStore';

function formatRemaining(ms: number) {
  if (ms <= 0) return "0s";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h >= 1) return `${h}h`;
  if (m >= 1) return `${m}m`;
  return `${s}s`;
}
function variantByMs(ms: number) {
  const h = ms / (1000 * 60 * 60);
  if (h <= 4) return "danger";
  if (h <= 12) return "warn";
  return "ok";
}

type Props = { item: RequestHelpResponse };

export function RequestHelpCard({ item }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const qs = sp.toString();
  // API envía UTC sin zona (ej: 2025-09-27T23:30:47.957) → parseamos como UTC
  const created = useMemo(() => parseApiUtc(item.createdAt as any), [item.createdAt]);
  const expires = useMemo(() => parseApiUtc(item.expiresAt as any), [item.expiresAt]);

  const [now, setNow] = useState(() => Date.now());
  const [navLoading, setNavLoading] = useState(false);
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const remainingMs = Math.max(0, +expires - now);
  const remainingText = formatRemaining(remainingMs);
  const urgency = variantByMs(remainingMs);

  // Reactive tilt + glow using framer-motion
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

  function onCardClick() {
    setFlipped((f) => !f);
  }

  function formatSlot(startIso: string, endIso: string) {
    return formatLocalSlot(startIso, endIso);
  }

  function openDetail() {
    const id = (item as any).CodeRequestHelp ?? (item as any).codeRequestHelp;
    // Persist selection for the detail page
    try { 
      useLiveHelpStore.getState().setSelected(item); 
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('livehelp:selected', JSON.stringify(item));
      }
    } catch {}
    // Guardar el item en un store para usar data real en el detalle
    setNavLoading(true);
    setTimeout(() => {
      router.push(`/forum/liveHelp/detail/${encodeURIComponent(String(id))}`);
    }, 550);
  }

  function onHelp() {
    // TODO: aquí podés abrir modal/detalle o navegar a la solicitud
    console.log("Ayudar clicked", item.titleHelp);
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
        ['--px' as any]: glowX,
        ['--py' as any]: glowY,
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onClick={onCardClick}
    >
      <div className={`${styles.flipContainer} ${flipped ? styles.flipped : ''}`}>
        <div className={styles.front}>
          {/* Top row: avatar + right panel (timer, reward, button) */}
          <div className={styles.topRow}>

        <AvatarUser 
          tagUser={item.userCreator?.initials ?? "AU"} 
          imageUser={item.userCreator?.image}
          descripcionCorta={item.userCreator?.shortDescription ?? ''}
          descripcionLarga={item.userCreator?.longDescription ?? ''}
          nombreCompleto={item.userCreator?.completeName ?? ''}
          direction='right'
        /> {/*Anonimous User*/}

        {/* <div className={styles.avatar}>
          {item.userCreator.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.userCreator.image}
              alt={item.userCreator.completeName}
            />
          ) : (
            <span>{item.userCreator.initials?.[0] ?? "?"}</span>
          )}
        </div> */}

        <div className={styles.rightPanel}>
          <div className={styles.timerAndReward}>

            <ExpiryTimer
              expiresAt={expires}
              startedAt={created}
              size={34}
              onExpire={() => {
                // opcional: invalidar query, marcar como expirada, etc.
                // console.log('expired', item.titleHelp);
              }}
            />
            <div className={styles.rewardBadge}>
              <Trophy size={16} className={styles.trophy} />
              <span className={styles.regard}>{item.regard.toFixed(2)}</span>
            </div>
          </div>
          {/* Evitar flip al clickear el botn */}
          <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
            <Button 
              onClick={openDetail}
              icon={<HandshakeIcon />}
              circular
              ariaLabel="Ofrecer ayuda"
              title="Ofrecer ayuda"
            />
          </div>
        </div>
      </div>

      {/* Title + description */}
      <h3 className={styles.title} title={item.titleHelp}>
        {item.titleHelp}
      </h3>
      <p className={styles.description} title={item.message}>
        {item.message}
      </p>

      {/* Languages (y opcionalmente labels) */}
      <div className={styles.tagsRow}>
        <div className={styles.langRow}>
          {(item.languages ?? []).map((lang) => (
            <span key={lang} className={styles.langChip}>
              {lang}
            </span>
          ))}
        </div>

        <div className={styles.tagRow}>
          {(item.labels ?? []).slice(0, 6).map((l) => (
            <span key={l} className={styles.tagChip}>
              {l}
            </span>
          ))}
        </div>
      </div>
        </div>

        {/* BACK: time slots */}
        <div className={styles.back}>
          <div className={styles.backHeader}>
            <span className={styles.backTitle}>Franjas horarias</span>
            <span className={styles.backHint}>Click para volver</span>
          </div>
          <div className={styles.slots}>
            {item.timeSlot?.slots?.length ? (
              item.timeSlot.slots.map((s, idx) => (
                <div key={`${s.start}-${s.end}-${idx}`} className={styles.slotItem}>
                  {formatSlot(s.start, s.end)}
                </div>
              ))
            ) : (
              <div className={styles.noSlots}>Sin franjas horarias definidas</div>
            )}
          </div>
        </div>
      </div>
     
    </motion.article>
    </>
  );
}
