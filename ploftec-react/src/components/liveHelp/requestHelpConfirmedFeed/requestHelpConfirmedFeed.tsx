"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../requestHelpFeed/requestHelpFeed.module.css";
import type { RequestHelpConfirmedResponse } from "@/lib/types/forum";
import { RequestHelpConfirmedCard } from "../requestHelpConfirmedCard/requestHelpConfirmedCard";

type Props = {
  items: RequestHelpConfirmedResponse[];
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const itemVariant = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.98 },
};

function RequestHelpConfirmedFeedInner({ items }: Props) {
  if (!items.length) return null;

  return (
    <section className={styles.feed}>
      <motion.div className={styles.grid} variants={container} initial="hidden" animate="show">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.div
              key={`confirmed-${item.codeRequestHelp}`}
              className={styles.cardWrap}
              variants={itemVariant}
              layout
            >
              <RequestHelpConfirmedCard item={item} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}

export const RequestHelpConfirmedFeed = memo(RequestHelpConfirmedFeedInner);
