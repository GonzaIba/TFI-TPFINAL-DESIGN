// src/components/liveHelp/RequestHelpFeed.tsx
"use client";

import { useEffect, memo, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RequestHelpCard } from "@/components/liveHelp/requestHelpCard/requestHelpCard";
import { useRequestsHelpInfinite } from "@/lib/query/hooks/forum/useRequestHelp";
import styles from "./requestHelpFeed.module.css";
import { Button, LiveHelpErrorCard } from "@/components";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { getErrorMessage } from "@/lib/utils/getErrorMessage";

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
  show: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.98 },
};

function RequestHelpFeedInner({
  pageSize = 9,
  search,
  refresh = 0,
  enabled = true,
  onCountChange,
}: Props) {
  const retryModeRef = useRef<"auto" | "manual">("auto");
  const {
    data: items = [],
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
    error,
    refetch,
  } = useRequestsHelpInfinite(pageSize, search, refresh, enabled, () => retryModeRef.current);

  // reporta conteo al padre (para "Total solicitudes")
  useEffect(() => {
    onCountChange?.(items.length, !!hasNextPage);
  }, [items.length, hasNextPage, onCountChange]);

  const errorMessage = useMemo(
    () => getErrorMessage(error, "No pudimos cargar las solicitudes de ayuda. Intenta nuevamente mas tarde."),
    [error],
  );

  const handleRetry = useCallback(() => {
    retryModeRef.current = "manual";
    void refetch().finally(() => {
      retryModeRef.current = "auto";
    });
  }, [refetch]);

  const handleSupport = useCallback(() => {
    if (typeof window === "undefined") return;
    window.open("mailto:soporte@ploftec.com?subject=LiveHelp%20incident", "_blank");
  }, []);

  if (isError) {
    return (
      <section className={styles.feed}>
        <div className={styles.errorCardWrap}>
          <LiveHelpErrorCard
            title="No pudimos cargar las solicitudes"
            description={errorMessage}
            onRetry={handleRetry}
            hint="Puedes refrescar la pagina o intentar otra vez en unos segundos."
            supportText="Ver estado del servicio"
            onSupport={handleSupport}
          />
        </div>
      </section>
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
          <Button
            onClick={() => {
              void fetchNextPage();
            }}
            text={isFetchingNextPage ? "Cargando..." : "Cargar más"}
            icon={<ExpandMoreIcon fontSize="small" />}
            loading={isFetchingNextPage}
            disabled={!hasNextPage || isFetchingNextPage}
            width="150px"
          />
        </div>
      )}
    </section>
  );
}

export const RequestHelpFeed = memo(RequestHelpFeedInner);
