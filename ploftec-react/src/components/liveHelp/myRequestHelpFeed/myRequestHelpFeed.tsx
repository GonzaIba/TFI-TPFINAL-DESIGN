// src/components/liveHelp/myRequestHelpFeed/myRequestHelpFeed.tsx
"use client";

import { memo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import { RequestHelpCard } from "@/components/liveHelp/requestHelpCard/requestHelpCard";
import { useMyRequestsHelp } from "@/lib/query/hooks/forum/useRequestHelp";
import { Loading } from "@/components";
import { useAlertsLayer } from "@/components/alerts/alertsLayer";
import styles from "../requestHelpFeed/requestHelpFeed.module.css";
import { Plus } from "lucide-react";

type Props = { enabled?: boolean };

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const itemVariant = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.98 },
};

function MyRequestHelpFeedInner({ enabled = true }: Props) {
  const { data: items = [], isLoading, isError, error } = useMyRequestsHelp(enabled);
  const { getBadgesForRequest } = useAlertsLayer();

  if (isError) {
    return (
      <div className={styles.error}>
        Ocurrió un error al cargar tus solicitudes: {(error as Error)?.message}
      </div>
    );
  }

  return (
    <section className={styles.feed}>
      <motion.div className={styles.grid} variants={container} initial="hidden" animate="show">
        {/* Crear solicitud de ayuda (en esta sección) */}
        <CreateHelpCard />

        {/* Skeletons */}
        {((isLoading || !enabled) && items.length === 0) &&
          Array.from({ length: 2 }).map((_, i) => (
            <div key={`my-sk-${i}`} className={styles.cardWrap}>
              <div className={styles.skeleton} />
            </div>
          ))}

        {/* Mis Cards */}
        <AnimatePresence initial={false}>
          {!isLoading &&
            items.map((it, i) => {
              const requestCode =
                (it as any).CodeRequestHelp ?? (it as any).codeRequestHelp;
              const badges = requestCode
                ? getBadgesForRequest(requestCode)
                : [];
              return (
                <motion.div
                  key={`my-${it.titleHelp}-${it.createdAt}-${i}`}
                  className={styles.cardWrap}
                  variants={itemVariant}
                  layout
                >
                  <RequestHelpCard
                    item={it}
                    hideOwnerAvatar
                    badges={badges}
                  />
                </motion.div>
              );
            })}
        </AnimatePresence>
      </motion.div>

      {/* No hay paginado en 'mis solicitudes' */}
    </section>
  );
}

export const MyRequestHelpFeed = memo(MyRequestHelpFeedInner);

function CreateHelpCard() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();
  const qs = sp.toString();
  const target = `/forum/liveHelp/new${qs ? `?${qs}` : ''}`;

  const tiltX = useSpring(0, { stiffness: 260, damping: 20, mass: 0.6 });
  const tiltY = useSpring(0, { stiffness: 260, damping: 20, mass: 0.6 });
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const glow = useMotionTemplate`radial-gradient(600px 200px at ${glowX}px ${glowY}px, rgba(127,90,240,0.10), transparent 60%)`;
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

  function redirectCreate() {
    setLoading(true);
    setTimeout(() => router.push(target), 700);
  }

  return (
    <>
      <Loading show={loading} />
      <motion.div className={styles.cardWrap} variants={itemVariant} layout>
        <motion.article
          className={styles.createCard}
          onClick={() => redirectCreate()}
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 220, damping: 20 }}
          style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 900, background: bg as any }}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          aria-label="Crear solicitud de ayuda"
        >
          <div className={styles.plusButton} aria-hidden>
            <Plus size={28} color="#eaeaea" />
          </div>
          <div className={styles.createText}>Crear solicitud de ayuda</div>
        </motion.article>
      </motion.div>
    </>
  );
}
