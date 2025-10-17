'use client';

import React, { useCallback, useId } from 'react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CampaignIcon from '@mui/icons-material/Campaign';
import { ForumAlert } from '@/lib/types/alerts';
import styles from './alertModal.module.css';

type AlertModalProps = {
  alert: ForumAlert;
  onClose: () => void;
  onPrimary: () => void;
  setPrimaryButtonRef: (button: HTMLButtonElement | null) => void;
};

const severityLabel: Record<string, string> = {
  critical: 'Alerta crítica',
  high: 'Alerta importante',
  warning: 'Advertencia',
  info: 'Información',
};

const iconBySeverity: Record<string, React.ReactNode> = {
  critical: <CampaignIcon fontSize="large" />,
  high: <CampaignIcon fontSize="large" />,
  warning: <WarningAmberIcon fontSize="large" />,
  info: <WarningAmberIcon fontSize="large" />,
};

export function AlertModal({
  alert,
  onClose,
  onPrimary,
  setPrimaryButtonRef,
}: AlertModalProps) {
  const titleId = useId();
  const descriptionId = useId();

  const severityKey = (alert.severity ?? '').toString().toLowerCase();
  const titleText = alert.title || severityLabel[severityKey] || 'Alerta del sistema';

  const assignPrimary = useCallback(
    (node: HTMLButtonElement | null) => {
      setPrimaryButtonRef(node);
    },
    [setPrimaryButtonRef],
  );

  const assignFallback = useCallback(
    (node: HTMLButtonElement | null) => {
      if (!alert.cta) {
        setPrimaryButtonRef(node);
      }
    },
    [alert.cta, setPrimaryButtonRef],
  );

  return (
    <div
      className={styles.modalInner}
      role="document"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <header className={styles.header}>
        <div className={`${styles.iconWrap} ${styles[severityKey] || ''}`}>
          {iconBySeverity[severityKey] ?? <CampaignIcon fontSize="large" />}
        </div>
        <div className={styles.headerText}>
          <span className={styles.severity}>
            {severityLabel[severityKey] ?? 'Aviso'}
          </span>
          <h2 id={titleId} className={styles.title}>
            {titleText}
          </h2>
        </div>
      </header>

      <div id={descriptionId} className={styles.description}>
        <p>{alert.message}</p>
      </div>

      <footer className={styles.actions}>
        {alert.cta?.href && (
          <button
            type="button"
            className={`${styles.button} ${styles.primary}`}
            onClick={onPrimary}
            ref={assignPrimary}
          >
            {alert.cta.label}
          </button>
        )}
        <button
          type="button"
          className={`${styles.button} ${styles.secondary}`}
          onClick={onClose}
          ref={assignFallback}
        >
          Cerrar
        </button>
      </footer>
    </div>
  );
}
