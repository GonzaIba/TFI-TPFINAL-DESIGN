'use client';

import { LabelResponse } from '@/lib/types/forum';
import styles from './labelCard.module.css';
import { useLayoutEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useMotionTemplate } from 'framer-motion';

interface Props {
  label: LabelResponse;
  onClick?: () => void;
}

export function LabelCard({ label, onClick }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [showMoreLink, setShowMoreLink] = useState(false);
  const descRef = useRef<HTMLParagraphElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

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

  // Subtle 3D tilt + cursor glow (perf-friendly)
  const tiltX = useSpring(0, { stiffness: 260, damping: 20, mass: 0.6 });
  const tiltY = useSpring(0, { stiffness: 260, damping: 20, mass: 0.6 });
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const glow = useMotionTemplate`radial-gradient(600px 200px at ${glowX}px ${glowY}px, rgba(127,90,240,0.10), transparent 60%)`;
  const bg = useMotionTemplate`${glow}`;

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dx = x / rect.width - 0.5;
    const dy = y / rect.height - 0.5;
    tiltX.set(-(dy * 10));
    tiltY.set(dx * 10);
    glowX.set(x);
    glowY.set(y);
  }

  function onMouseLeave() {
    tiltX.set(0);
    tiltY.set(0);
  }

  return (
    <motion.div
      key={label.codeLabel + "card"}
      className={`${styles.card} ${expanded ? styles.expanded : ''}`}
      ref={cardRef}
      onClick={onClick}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 220, damping: 20 }}
      style={{
        willChange: 'transform, box-shadow, background',
        transform: 'translateZ(0)',
        rotateX: tiltX,
        rotateY: tiltY,
        transformPerspective: 900,
        background: bg as any,
        ['--px' as any]: glowX,
        ['--py' as any]: glowY,
      }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
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
