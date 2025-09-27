// src/components/liveHelp/RequestHelpFeed.tsx
"use client";

import { useEffect, memo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import { RequestHelpCard } from "@/components/liveHelp/requestHelpCard/requestHelpCard";
import { useRequestsHelpInfinite } from "@/lib/query/hooks/forum/useRequestHelp";
import { Loading } from '@/components';
import styles from "./requestHelpFeed.module.css";
import { Plus } from "lucide-react";

type Props = {
  pageSize?: number;
  search?: string;
  refresh?: number;
  enabled?: boolean;
  onCountChange?: (visible: number, hasMore: boolean) => void;
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const itemVariant = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show:   { opacity: 1, y: 0,  scale: 1   },
  exit:   { opacity: 0, y: 10, scale: 0.98 },
};

function RequestHelpFeedInner({ pageSize = 9, search, refresh = 0, enabled = true, onCountChange }: Props) {
  const {
    data: items = [],
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    error,
  } = useRequestsHelpInfinite(pageSize, search, refresh, enabled);

  // reporta conteo al padre (para "Total solicitudes")
  useEffect(() => {
    onCountChange?.(items.length, !!hasNextPage);
  }, [items.length, hasNextPage, onCountChange]);

  if (isError) {
    return (
      <div className={styles.error}>
        Ocurrió un error al cargar las solicitudes: {(error as Error)?.message}
      </div>
    );
  }

  return (
    <section className={styles.feed}>
      <motion.div className={styles.grid} variants={container} initial="hidden" animate="show">
        {/* Create new help request card (always visible at the start) */}
        <CreateHelpCard />
        {/* Skeletons */}
        {(isLoading || !enabled) &&
          Array.from({ length: pageSize }).map((_, i) => (
            <div key={`sk-${i}`} className={styles.cardWrap}>
              <div className={styles.skeleton} />
            </div>
          ))}

        {/* Cards */}
        <AnimatePresence initial={false}>
          {!isLoading &&
            items.map((it, i) => (
              <motion.div
                key={`${it.titleHelp}-${it.createdAt}-${i}`}
                className={styles.cardWrap}
                variants={itemVariant}
                layout
              >
                <RequestHelpCard item={it} />
              </motion.div>
            ))}
        </AnimatePresence>
      </motion.div>

      {/* Load more */}
      {hasNextPage && (
        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={!hasNextPage || isFetchingNextPage}
            className={styles.loadMore}
          >
            {isFetchingNextPage ? "Loading..." : "Load more"}
          </button>
        </div>
      )}
    </section>
  );
}

export const RequestHelpFeed = memo(RequestHelpFeedInner);

function CreateHelpCard() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const sp = useSearchParams();
  const qs = sp.toString();
  const target = `/forum/liveHelp/new${qs ? `?${qs}` : ''}`;
  // 3D tilt + glow like RequestHelpCard
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
          style={{
            rotateX: tiltX,
            rotateY: tiltY,
            transformPerspective: 900,
            background: bg as any,
          }}
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
