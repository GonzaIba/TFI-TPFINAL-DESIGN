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