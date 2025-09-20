'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './expiryTimer.module.css';

type Props = {
  expiresAt: string | number | Date;
  size?: number;            // diámetro del reloj (px)
  onExpire?: () => void;
  className?: string;
  speedSecondsPerLap?: number; // velocidad del “orbital” (default 60s/vuelta)
};

function formatRemaining(ms: number): string {
  if (ms <= 0) return '0s';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h >= 1) return `${h}h`;
  if (m >= 1) return `${m}m`;
  return `${s}s`;
}

function statusByMs(ms: number): 'ok' | 'warn' | 'danger' {
  const h = ms / 3_600_000;
  if (h < 3) return 'danger';
  if (h < 16) return 'warn';
  return 'ok';
}

/** ticks inteligentes para minimizar renders */
function computeNextDelay(msRemaining: number): number {
  if (msRemaining <= 0) return 0;
  if (msRemaining >= 3_600_000) {
    const msToNextMinute = 60_000 - (msRemaining % 60_000);
    return Math.min(msToNextMinute, 60_000);
  }
  if (msRemaining >= 60_000) {
    const msToNext5s = 5_000 - (msRemaining % 5_000);
    return Math.min(msToNext5s, 5_000);
  }
  const msToNextSecond = 1_000 - (msRemaining % 1_000);
  return Math.min(msToNextSecond, 1_000);
}

export function ExpiryTimer({
  expiresAt,
  size = 30,
  onExpire,
  className,
  speedSecondsPerLap = 60,
}: Props) {
  const target = useMemo(() => +new Date(expiresAt), [expiresAt]);
  const [now, setNow] = useState(() => Date.now());
  const tRef = useRef<number | null>(null);

  const remaining = Math.max(0, target - now);
  const text = formatRemaining(remaining);
  const status = statusByMs(remaining);

  useEffect(() => {
    return () => { if (tRef.current) window.clearTimeout(tRef.current); };
  }, []);

  useEffect(() => {
    if (remaining <= 0) {
      if (tRef.current) window.clearTimeout(tRef.current);
      onExpire?.();
      return;
    }
    const delay = computeNextDelay(remaining);
    tRef.current = window.setTimeout(() => setNow(Date.now()), delay);
  }, [remaining, onExpire]);

  const dim = size;
  const ringThickness = Math.max(2, Math.floor(dim * 0.09));
  const orbSize = Math.max(4, Math.floor(dim * 0.16)); // tamaño del punto orbital

  // duración de la vuelta en CSS
  const lapDuration = `${speedSecondsPerLap}s`;

  return (
    <div
      className={[
        styles.wrapper,
        styles[status],
        className ?? ''
      ].join(' ')}
      aria-live="polite"
      title={`Tiempo restante: ${text}`}
    >
      <div
        className={styles.clock}
        style={
          {
            width: dim,
            height: dim,
            '--thick': `${ringThickness}px`,
            '--orb': `${orbSize}px`,
            '--lap': lapDuration,
          } as React.CSSProperties
        }
        aria-hidden
      >
        {/* anillo base */}
        <div className={styles.ring} />
        {/* halo sutil */}
        <div className={styles.halo} />
        {/* orbital: un contenedor que rota y un punto posicionado en el borde */}
        <div className={styles.orbit}>
          <div className={styles.dot} />
        </div>
        {/* punto central */}
        <div className={styles.center} />
      </div>

      <span className={styles.timeText}>{text}</span>
    </div>
  );
}
