'use client';

import React from 'react';
import styles from './panelSection.module.css';

export interface PanelSectionProps<T> {
  isDownCard?: boolean;
  /** Título que aparece en la franja superior */
  title: string;
  /** Lista de ítems a renderizar */
  items: T[];
  /** Flag de carga */
  loading: boolean;
  /** Render a mostrar mientras `loading` */
  renderLoading: React.ReactNode;
  /** Función que devuelve el nodo de cada ítem */
  renderItem: (item: T, index: number) => React.ReactNode;
  /** Nodo a mostrar cuando `items.length === 0` */
  emptyMessage: React.ReactNode;
  /** Permite inyectar classes adicionales si querés sobre-escribir estilos */
  className?: string;
  /** Función para obtener la key única de cada item (opcional pero recomendado) */
  getKey?: (item: T, index: number) => string | number;
}

/**
 * Tarjeta reutilizable para mostrar rankings / listados con la misma estética.
 */
export function PanelSection<T>({
  isDownCard = false,
  title,
  items,
  loading,
  renderLoading,
  renderItem,
  emptyMessage,
  className = '',
  getKey,
}: PanelSectionProps<T>) {
  return (
    <div className={`${styles.panelSection} ${className}`} style={isDownCard ? {marginTop:"8px"} : {}}>
      <div className={styles.panelSectionSquare} style={isDownCard ? {paddingTop:"24px"} : {}}>
        <div className={styles.panelSectionTitle}>{title}</div>
        <div className={styles.panelSectionContainer}>
          <div className={styles.panelSectionElements}>
            {loading ? (
              renderLoading
            ) : items.length > 0 ? (
              items.map((item, index) => (
                <React.Fragment key={getKey?.(item, index) ?? index}>
                  {renderItem(item, index)}
                </React.Fragment>
              ))
            ) : (
              emptyMessage
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
