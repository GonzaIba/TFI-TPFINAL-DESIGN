'use client';

import React from 'react';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ReplayIcon from '@mui/icons-material/Replay';
import styles from './errorMiniCard.module.css';

type Props = {
  title: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
};

export function ErrorMiniCard({
  title,
  description,
  onRetry,
  retryLabel = 'Reintentar',
  className,
}: Props) {
  const cardClassName = className ? `${styles.card} ${className}` : styles.card;

  return (
    <div className={cardClassName}>
      <div className={styles.icon}>
        <WarningAmberRoundedIcon fontSize="small" />
      </div>
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        {description ? <p className={styles.description}>{description}</p> : null}
        {onRetry ? (
          <button type="button" className={styles.retryButton} onClick={onRetry}>
            <ReplayIcon fontSize="small" />
            <span>{retryLabel}</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

