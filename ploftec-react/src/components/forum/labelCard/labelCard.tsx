'use client';

import { LabelResponse } from '@/lib/types/forum';
import styles from './labelCard.module.css';
import { useLayoutEffect, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  label: LabelResponse;
  onClick?: () => void;
}

export function LabelCard({ label, onClick }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showMoreLink, setShowMoreLink] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);

  useLayoutEffect(() => {
    const el = descRef.current;
    if (el) {
      const isOverflowing = el.scrollHeight > el.clientHeight;
      setShowMoreLink(isOverflowing);
    }
  }, [label.description]);

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(prev => !prev);
  };

  return (
    <motion.div
      key={label.codeLabel + "card"}
      className={`${styles.card} ${expanded ? styles.expanded : ''}`}
      onClick={onClick}
      whileHover={{
        boxShadow: '0 0 6px #bdaaff, 0 0 12px #bdaaff, 0 0 18px #bdaaff',
        scale: 1.02,
      }}
      whileTap={{
        scale: 0.97,
        boxShadow: '0 0 4px #bdaaff, 0 0 8px #bdaaff',
      }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        willChange: 'transform, box-shadow',
        transform: 'translateZ(0)'
      }}
    >

      <h2 className={styles.title}>{label.name}</h2>

      <p
        ref={descRef}
        className={`${styles.description} ${expanded ? styles.expandedText : ''}`}
      >
        {label.description}
      </p>

      {!expanded && showMoreLink && (
        <span className={styles.moreLink} onClick={handleToggleExpand}>
          Ver más
        </span>
      )}

      <AnimatePresence>
        {expanded && (
          <motion.button
            className={styles.lessLink}
            onClick={handleToggleExpand}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Ver menos
          </motion.button>
        )}
      </AnimatePresence>

      <div className={styles.meta}>
        <span>Aparece en {label.countThisWeek} publicaciones esta semana</span>
        <span>Aparece en {label.countTotal} preguntas en total</span>
      </div>
    </motion.div>
  );
}
