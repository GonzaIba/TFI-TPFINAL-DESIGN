import React from 'react';
import styles from './chipComponent.module.css';

interface ChipComponentProps {
  /** Texto que muestra el chip */
  label: string;
  /** Nodo React para el botón (ícono de borrar, por ejemplo) */
  button?: React.ReactNode;
}

/**
 * Componente casero tipo "chip" que usa CSS Modules.
 */
export function ChipComponent({ label, button }: ChipComponentProps) {
  return (
    <div className={styles.chip}>
      {button && <span className={styles.button}>{button}</span>}
      <span className={styles.label}>{label}</span>
    </div>
  );
}

export default ChipComponent;
