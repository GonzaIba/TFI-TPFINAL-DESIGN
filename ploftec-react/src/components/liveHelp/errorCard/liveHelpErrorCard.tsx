'use client';

import React from 'react';
import { motion } from 'framer-motion';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import HeadphonesRoundedIcon from '@mui/icons-material/HeadphonesRounded';
import styles from './liveHelpErrorCard.module.css';

type Props = {
  title: string;
  description?: string;
  onRetry: () => void;
  hint?: string;
  supportText?: string;
  onSupport?: () => void;
};

export const LiveHelpErrorCard: React.FC<Props> = ({
  title,
  description,
  onRetry,
  hint = 'Si el problema persiste, por favor avisanos para que podamos ayudarte.',
  supportText = 'Contactar soporte',
  onSupport,
}) => {
  return (
    <motion.article
      className={styles.card}
      initial={{ opacity: 0, scale: 0.96, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 180, damping: 20 }}
    >
      <div className={styles.glow} aria-hidden />
      <div className={styles.pulse} aria-hidden />

      <header className={styles.header}>
        <span className={styles.badge}>
          <WarningAmberRoundedIcon fontSize="small" />
          Centro de ayuda
        </span>
        <div className={styles.iconWrap}>
          <WarningAmberRoundedIcon />
        </div>
      </header>

      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {hint && <p className={styles.hint}>{hint}</p>}

      <div className={styles.actions}>
        <button type="button" className={styles.retryButton} onClick={onRetry}>
          <RefreshRoundedIcon fontSize="small" />
          Reintentar
        </button>
        <button type="button" className={styles.supportButton} onClick={onSupport} disabled={!onSupport}>
          <HeadphonesRoundedIcon fontSize="small" />
          {supportText}
        </button>
      </div>
    </motion.article>
  );
};

