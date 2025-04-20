'use client';

import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import styles from './search.module.css';

type SearchProps = {
  searchFunction?: (query: string) => void;
  showHelpCodeOptions?: boolean;
  placeHolder?: string;
  showIcon?: boolean;
  onInput?: (event: ChangeEvent<HTMLInputElement>) => void;
};

export default function Search({
  searchFunction,
  showHelpCodeOptions = false,
  placeHolder = '',
  showIcon = true,
  onInput
}: SearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

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
    <div className={styles.searchContainer}>
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
        {showHelpCodeOptions && (
          <div className={styles.searchModal} style={{ display: "none" }}>
            <div className={styles.searchOptionsLeft}>
              <div className={styles.searchOption}>[etiqueta] buscar dentro de una etiqueta</div>
              <div className={styles.searchOption}>user:1234 buscar por autor</div>
              <div className={styles.searchOption}>&quot;palabras aquí&quot; frase exacta</div>
            </div>
            <div className={styles.searchOptionsRight}>
              <div className={styles.searchOption}>answers:0 preguntas sin respuestas</div>
              <div className={styles.searchOption}>score:3 publicaciones con una puntuación de +3</div>
              <div className={styles.searchOption}>isaccepted:yes buscar dentro de un estado</div>
            </div>
          </div>
        )}
        {showIcon && (
          <div className={styles['icon']}>
            <i className="fas fa-search" onClick={performSearch}></i>
          </div>
        )}
      </div>
    </div>
  );
}