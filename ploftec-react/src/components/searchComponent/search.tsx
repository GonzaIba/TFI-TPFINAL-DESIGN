'use client';

import React, { useState, useEffect, useRef, KeyboardEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './search.module.css';

type SearchProps = {
  searchFunction?: (query: string) => void;
  placeHolder?: string;
  showIcon?: boolean;
  useSearch?: boolean
  onInput?: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function Search({
  searchFunction,
  placeHolder = '',
  showIcon = true,
  useSearch = true,
  onInput
}: SearchProps) {

  const [searchQuery, setSearchQuery] = useState('');
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

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchFunction) {
      searchFunction(searchQuery);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onInput) {
      onInput(e); // ✅ Esto permite propagar el input hacia InputLabel
    }
  };

  const performSearch = () => {
    if (searchFunction) {
      searchFunction(searchQuery);
    }
  };

  return (
    <div ref={containerRef} className={styles.searchContainer} onClick={() => setShowSearchOptions(true)}>
      <div className={styles.searchInput}>
      <input
          type="text"
          placeholder={placeHolder}
          value={searchQuery}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          style={{
            padding: showIcon ? '0 60px 0 20px' : '10px'
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
    </div>
  );
}