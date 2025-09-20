'use client';

import React, { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './input.module.css';
import { X } from 'lucide-react';
import { Colors } from '@/theme/colors';

type InputProps = {
  submitFunction?: (query: string) => void;
  placeHolder?: string;
  showIcon?: boolean;
  useSearch?: boolean;
  onInput?: (event: ChangeEvent<HTMLInputElement>) => void;
  customStyle?: React.CSSProperties;
  error?: boolean;
  errorText?: string;
  widthContainer?: string;
  value?: string;
  useClear?: boolean;
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
  value,
  useClear = false
}: InputProps) {

  const [searchQuery, setSearchQuery] = useState(value ?? '');
  const [showSearchOptions, setShowSearchOptions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSearchOptions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? (value as string) : searchQuery;

  // Mantener sincronía solo cuando NO es controlado desde fuera
  useEffect(() => {
    if (!isControlled && value !== undefined) setSearchQuery(value);
  }, [value, isControlled]);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && submitFunction) submitFunction(searchQuery);
    if (e.key === 'Escape' && useClear && searchQuery !== '') handleClear(); // opcional: ESC limpia
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setSearchQuery(e.target.value);
    onInput?.(e); // propaga hacia afuera
  };

  const performSearch = () => {
    if (submitFunction) submitFunction(searchQuery);
  };

  const handleClear = () => {
    // Si es no-controlado, limpiamos local
    if (value === undefined) setSearchQuery('');
    // Notificamos al padre (si escucha onInput). Hack simple y efectivo.
    onInput?.({ target: { value: '' } } as unknown as ChangeEvent<HTMLInputElement>);
    // Limpiamos el input real y enfocamos
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  return (
    <div
      ref={containerRef}
      className={styles.searchContainer}
      onClick={() => setShowSearchOptions(true)}
      style={{ width: widthContainer }}
    >
      <div className={styles.searchInput}>
        <motion.input
          ref={inputRef}
          type="text"
          placeholder={placeHolder}
          value={currentValue}
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
          whileFocus={{ borderColor: error ? Colors.error : Colors.primary }}
        />

        {/* CLEAR BUTTON */}
        <AnimatePresence>
          {useClear && searchQuery !== '' && (
            <motion.button
              type="button"
              className={styles.clearSearch}
              onClick={handleClear}
              aria-label="Limpiar búsqueda"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.95 }}
              // lo ubicamos correctamente según si hay ícono de búsqueda
              style={{ right: showIcon ? 36 : 10, top: '10px', transform: 'translateY(-50%)' }}
            >
              <X size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        {showIcon && (
          <div className={styles['icon']}>
            <i className="fas fa-search" onClick={performSearch}></i>
          </div>
        )}

        <AnimatePresence>
          {showSearchOptions && useSearch && (
            <motion.div
              className={styles.searchModal}
              style={{ display: 'block' }}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.searchOptionsLeft}>
                <div className={styles.searchOption}>[etiqueta] buscar dentro de una etiqueta</div>
                <div className={styles.searchOption}>usuario:Pepe buscar por autor</div>
                <div className={styles.searchOption}>"palabras aquí" frase exacta</div>
              </div>
              <div className={styles.searchOptionsRight}>
                <div className={styles.searchOption}>respuestas:0 preguntas sin respuestas</div>
                <div className={styles.searchOption}>recompensa:3 publicaciones con una puntuación de +3</div>
                <div className={styles.searchOption}>fecha:21/2/2024</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
            style={{ color: Colors.error }}
          >
            {errorText}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
