// hooks/useWindowWidth.ts
import { useState, useEffect } from 'react';

export function useWindowWidth(): number {
  // Inicializa con 0 para soportar SSR; al montarse en cliente
  // se actualizará inmediatamente al valor real.
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    // Escucha cambios de tamaño
    window.addEventListener('resize', handleResize);

    // Establece el ancho en el montaje
    handleResize();

    // Limpia el listener al desmontar
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return width;
}
