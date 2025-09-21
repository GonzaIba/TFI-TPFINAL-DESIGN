'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './expiryTimer.module.css';

type Props = {
  expiresAt: string | number | Date;
  startedAt?: string | number | Date; // para saber el total y dibujar el progreso
  size?: number;                      // diámetro del reloj (px)
  onExpire?: () => void;
  className?: string;
  warnAtHours?: number;   // umbral amarillo (default 16h)
  dangerAtHours?: number; // umbral rojo (default 3h)
  introFromHours?: number;   // de dónde arranca el barrido inicial (default 48h)
  introDurationMs?: number;  // duración de esa animación (default 900ms)
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

function statusByMs(ms: number, warnAtH = 16, dangerAtH = 3): 'ok' | 'warn' | 'danger' {
  const h = ms / 3_600_000;
  if (h < dangerAtH) return 'danger';
  if (h < warnAtH) return 'warn';
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
  startedAt,
  size = 36,
  onExpire,
  className,
  warnAtHours = 16,
  dangerAtHours = 3,
  introFromHours = 48,
  introDurationMs = 900,
}: Props) {
  const target = useMemo(() => +new Date(expiresAt), [expiresAt]);
  const start = useMemo(() => (startedAt ? +new Date(startedAt) : undefined), [startedAt]);
  const [now, setNow] = useState(() => Date.now());
  const tickRef = useRef<number | null>(null);
  const introTimeoutRef = useRef<number | null>(null);
  const introRaf1 = useRef<number | null>(null);
  const introRaf2 = useRef<number | null>(null);

  const remaining = Math.max(0, target - now);
  const text = formatRemaining(remaining);
  const status = statusByMs(remaining, warnAtHours, dangerAtHours);

  // Estado visual: barrido inicial desde 48h (o lo que se configure) hacia el real
  const [visualRemaining, setVisualRemaining] = useState<number>(() => introFromHours * 3_600_000);
  const [intro, setIntro] = useState(true);

  // Disparar el barrido al montar o cuando cambie el objetivo
  useEffect(() => {
    setIntro(true);
    setVisualRemaining(introFromHours * 3_600_000);
    // aseguramos un frame para que se pinte el estado inicial
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => {
        setVisualRemaining(remaining);
        // desactivar modo intro después de la duración configurada
        const tid = window.setTimeout(() => setIntro(false), introDurationMs);
        introTimeoutRef.current = tid;
      });
      introRaf2.current = raf2 as unknown as number;
    });
    introRaf1.current = raf1 as unknown as number;
    return () => {
      if (introTimeoutRef.current) window.clearTimeout(introTimeoutRef.current);
      if (introRaf1.current) cancelAnimationFrame(introRaf1.current);
      if (introRaf2.current) cancelAnimationFrame(introRaf2.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  // Mantener el estado visual sincronizado con el real en cada tick
  useEffect(() => {
    if (!intro) setVisualRemaining(remaining);
  }, [remaining, intro]);

  // Progreso NORMALIZADO A 48H para cumplir con tu regla (48h -> círculo lleno)
  const progress = Math.max(0, Math.min(1, visualRemaining / (48 * 3_600_000)));

  useEffect(() => {
    return () => {
      if (tickRef.current) window.clearTimeout(tickRef.current);
      if (introTimeoutRef.current) window.clearTimeout(introTimeoutRef.current);
      if (introRaf1.current) cancelAnimationFrame(introRaf1.current);
      if (introRaf2.current) cancelAnimationFrame(introRaf2.current);
    };
  }, []);

  useEffect(() => {
    if (remaining <= 0) {
      if (tickRef.current) window.clearTimeout(tickRef.current);
      onExpire?.();
      return;
    }
    const delay = computeNextDelay(remaining);
    tickRef.current = window.setTimeout(() => setNow(Date.now()), delay);
  }, [remaining, onExpire]);

  const dim = size;
  const stroke = Math.max(3, Math.floor(dim * 0.12));
  const r = 50 - stroke / 2; // viewBox 0 0 100 100
  const circ = 2 * Math.PI * r;
  // Aguja: 48h -> arriba; 24h -> abajo; 0h -> arriba
  const handAngle = 360 * (1 - progress); // 0° arriba, 90° derecha, 180° abajo, 270° izquierda

  return (
    <div
      className={[
        styles.wrapper,
        styles[status],
        className ?? ''
      ].join(' ')}
      aria-live="polite"
      title={`Tiempo restante: ${text}`}
      style={{ ['--trans' as any]: intro ? `${introDurationMs}ms` : undefined }}
    >
      <div className={styles.clock} style={{ width: dim, height: dim }} aria-hidden>
        <svg viewBox="0 0 100 100" width={dim} height={dim} className={styles.svg}>
          {/* glow */}
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* pista */}
          <circle cx="50" cy="50" r={r} className={styles.track} strokeWidth={stroke} />
          {/* ticks */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * 360;
            const len = i % 3 === 0 ? 8 : 5;
            const start = 50 - r + 2;
            const x1 = 50 + (r - start) * Math.cos((Math.PI / 180) * (a - 90));
            const y1 = 50 + (r - start) * Math.sin((Math.PI / 180) * (a - 90));
            const x2 = 50 + (r - start - len) * Math.cos((Math.PI / 180) * (a - 90));
            const y2 = 50 + (r - start - len) * Math.sin((Math.PI / 180) * (a - 90));
            return (
              <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={styles.tick} />
            );
          })}
          {/* progreso (12 en punto, sentido antihorario para que 24h pinte la izquierda) */}
          <g style={{ transform: 'rotate(-90deg) scale(-1,1)', transformOrigin: '50px 50px' }}>
            <circle
              cx="50"
              cy="50"
              r={r}
              className={styles.progress}
              strokeWidth={stroke}
              strokeDasharray={circ}
              strokeDashoffset={circ * (1 - progress)}
              filter="url(#glow)"
            />
          </g>
          {/* manecilla */}
          <g className={styles.hand} style={{ transform: `rotate(${handAngle}deg)` }}>
            <line x1="50" y1={50 - r + 4} x2="50" y2="50" />
            <circle cx="50" cy="50" r={Math.max(1.5, stroke * 0.25)} />
            <circle cx="50" cy={50 - r + 4} r={Math.max(1.5, stroke * 0.25)} />
          </g>
        </svg>
      </div>

      <span className={styles.timeText}>{text}</span>
    </div>
  );
}
