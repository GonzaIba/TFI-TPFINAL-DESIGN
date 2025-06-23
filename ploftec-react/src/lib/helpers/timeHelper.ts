/**
 * Retorna el string de la palabra clave concatenada a la palabra clave
 * @param palabraClave Ej. "Publicado hace"
 * @param dateTime Ej. "2025-05-31 13:36:00.6381333"
 */
export function getPublicationTimeAgo(palabraClave: string, dateTime: Date): string {
  const now = new Date();
  const difference = now.getTime() - new Date(dateTime).getTime();
  const minutes = Math.floor(difference / (1000 * 60));
  const hours = Math.floor(difference / (1000 * 60 * 60));
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return `${palabraClave} hace menos de un minuto`;
  } else if (hours < 1) {
    return `${palabraClave} hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;
  } else if (days < 1) {
    return `${palabraClave} hace ${hours} ${hours === 1 ? "hora" : "horas"}`;
  } else if (days < 30) {
    return `${palabraClave} hace ${days} ${days === 1 ? "día" : "días"}`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    return `${palabraClave} hace ${months} ${months === 1 ? "mes" : "meses"}`;
  } else {
    const years = Math.floor(days / 365);
    return `${palabraClave} hace ${years} ${years === 1 ? "año" : "años"}`;
  }
}


/**
 * Retorna true si dateStr ocurrió hace 60 minutos o menos.
 * @param dateStr Ej. "2025-05-31 13:36:00.6381333"
 */
export function isWithinLastHour(dateStr: string): boolean {
  // El constructor de Date exige el separador 'T' para ISO-8601,
  // por eso reemplazamos el espacio.
  const parsed = new Date(dateStr.replace(' ', 'T'));

  // Si la cadena no se pudo convertir a fecha válida, considera “vieja”.
  if (Number.isNaN(parsed.getTime())) {
    console.warn(`Fecha inválida: ${dateStr}`);
    return false;
  }

  // Milisegundos transcurridos desde la fecha dada hasta ahora
  const diffMs = Date.now() - parsed.getTime();

  // 1 hora en milisegundos = 60 seg * 60 min * 1000 ms = 3_600_000
  const oneHourMs = 60 * 60 * 1000;

  // Si ha pasado menos de una hora, estamos “within last hour”
  return diffMs < oneHourMs;
}

