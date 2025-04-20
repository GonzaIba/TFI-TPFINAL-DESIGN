  export function obtenerIniciales(nombreCompleto: string): string {
    if (!nombreCompleto || !nombreCompleto.trim()) {
      return "";
    }
  
    const palabras = nombreCompleto
      .split(" ")
      .filter(p => p.trim().length > 0); // Remueve espacios extra
  
    const iniciales = palabras.map(p => p[0].toUpperCase());
  
    return iniciales.join("");
  }
  