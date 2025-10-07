// src/components/liveHelp/RequestHelpFeed.tsx
"use client";

import { useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RequestHelpCard } from "@/components/liveHelp/requestHelpCard/requestHelpCard";
import { useRequestsHelpInfinite } from "@/lib/query/hooks/forum/useRequestHelp";
import styles from "./requestHelpFeed.module.css";

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
