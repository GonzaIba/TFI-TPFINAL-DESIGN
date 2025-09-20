'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components';
import styles from './selectComponent.module.css';

export type UiOption<T = string> = { text: string; value: T };

type Props<T> = {
  /** Opciones a renderizar */
  options: UiOption<T>[];

  /** Valor seleccionado (controlado) */
  value: T | null;

  /** Callback al seleccionar */
  onChange: (opt: UiOption<T>) => void;

  /** Texto cuando no hay selección */
  placeholder?: string;

  /** Ancho del trigger */
  width?: string | number;

  /** Ícono opcional para el trigger (ej: <FilterAltIcon />) */
  icon?: React.ReactNode;

  /** Deshabilitar */
  disabled?: boolean;

  /** Alineación del dropdown respecto al botón */
  align?: 'left' | 'right';

  /** Clase extra para wrapper (por layout) */
  className?: string;

  /** Suaviza más la animación del contenedor */
  springy?: boolean;
};

export default function AnimatedSelect<T = string>({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar…',
  width = 220,
  icon,
  disabled = false,
  align = 'left',
  className,
  springy = false,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedText = useMemo(() => {
    const found = options.find((o) => o.value === value) ?? null;
    return found?.text ?? placeholder;
  }, [options, value, placeholder]);

  // cerrar al click afuera
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  // accesibilidad simple con teclado
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const containerVariants = springy
    ? { initial: { opacity: 0, scale: 0.96 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.96 } }
    : { initial: { opacity: 0, scaleY: 0.95 }, animate: { opacity: 1, scaleY: 1 }, exit: { opacity: 0, scaleY: 0.95 } };

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} ref={ref}>
      <Button
        onClick={() => {
          if (!disabled) setOpen((p) => !p);
        }}
        icon={icon}
        transparent
        text={selectedText}
        width={typeof width === 'number' ? `${width}px` : width}
        disabled={disabled}
      />

      <AnimatePresence>
        {open && (
          <motion.ul
            className={`${styles.dropdown} ${align === 'right' ? styles.right : styles.left}`}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={containerVariants}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {options.map((opt, i) => {
              const active = opt.value === value;
              return (
                <motion.li
                  key={`${String(opt.value)}-${i}`}
                  className={`${styles.item} ${active ? styles.active : ''}`}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, delay: 0.12 + i * 0.05, ease: 'easeOut' }}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  role="option"
                  aria-selected={active}
                >
                  {opt.text}
                  {active && <span className={styles.check} aria-hidden>✓</span>}
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
