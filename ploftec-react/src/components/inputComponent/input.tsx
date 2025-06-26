'use client';

import React, { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './input.module.css';
import { Colors } from '@/theme/colors';

type InputProps = {
  submitFunction?: (query: string) => void;
  placeHolder?: string;
  showIcon?: boolean;
  useSearch?: boolean
  onInput?: (event: ChangeEvent<HTMLInputElement>) => void;
  customStyle?: React.CSSProperties;
  error?: boolean;
  errorText?: string;
  widthContainer?: string
  value?: string;
};

export function Input({
  submitFunction,
  placeHolder = '',
  showIcon = true,
  useSearch = true,
  onInput,
  customStyle,
  error = false,
  errorText = '',
  widthContainer = '100%',
  value
}: InputProps) {

  const [searchQuery, setSearchQuery] = useState(value ?? '');
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cierra el modal si el clic ocurre fuera del contenedor
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSearchOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value !== undefined) {
      setSearchQuery(value);
    }
  }, [value]);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && submitFunction) {
      submitFunction(searchQuery);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) {
      setSearchQuery(e.target.value);
    }
    if (onInput) {
      onInput(e); // ✅ Esto permite propagar el input hacia InputLabel
    }
  };

  const performSearch = () => {
    if (submitFunction) {
      submitFunction(searchQuery);
    }
  };

  return (
    <div ref={containerRef} className={styles.searchContainer} onClick={() => setShowSearchOptions(true)} style={{width: widthContainer}}>
      <div className={styles.searchInput}>
      <motion.input
        type="text"
        placeholder={placeHolder}
        value={searchQuery}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        style={{
          padding: showIcon ? '0 60px 0 20px' : '10px',
          ...(customStyle ?? {}),
          border: '2px solid transparent',
          borderRadius: 4,
          borderColor: error ? Colors.error : 'none',
          outline: 'none',
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        whileFocus={{
          borderColor: error ? Colors.error : Colors.primary,
        }}
      />
        <AnimatePresence>
          {showSearchOptions && useSearch && (
            <motion.div
              className={styles.searchModal}
              style={{display: 'block'}}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.searchOptionsLeft}>
                <div className={styles.searchOption}>[etiqueta] buscar dentro de una etiqueta</div>
                <div className={styles.searchOption}>user:1234 buscar por autor</div>
                <div className={styles.searchOption}>"palabras aquí" frase exacta</div>
              </div>
              <div className={styles.searchOptionsRight}>
                <div className={styles.searchOption}>answers:0 preguntas sin respuestas</div>
                <div className={styles.searchOption}>score:3 publicaciones con una puntuación de +3</div>
                <div className={styles.searchOption}>isaccepted:yes buscar dentro de un estado</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {showIcon && (
          <div className={styles['icon']}>
            <i className="fas fa-search" onClick={performSearch}></i>
          </div>
        )}
      </div>

      {/* ERROR TEXT ANIMADO */}
      <AnimatePresence>
        {error && (
          <motion.p
            className={styles.errorText}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            style={{color: Colors.error}}
          >
            {errorText}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}