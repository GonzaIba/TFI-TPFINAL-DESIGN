// src/lib/utils/getClientIp.ts
import axios from 'axios';

/**
 *  In-memory cache para la IP pública.
 *  - cachedIp   → almacena la IP una vez resuelta
 *  - inflight   → evita disparar varias peticiones simultáneas
 */
let cachedIp: string | null = null;
let inflight: Promise<string | null> | null = null;

/**
 * Devuelve la IP pública del cliente.
 * 1. Si ya está cacheada → devuelve el valor inmediatamente.
 * 2. Si hay una petición en curso → se “cuelga” de la misma.
 * 3. Si es la primera llamada → usa axios contra ipify y cachea el resultado.
 *
 * Retorna null en caso de error (bloqueo CORS, sin conexión, etc.).
 */
export async function getClientIp(): Promise<string | null> {
  // 1) IP ya resuelta
  if (cachedIp !== null) return cachedIp;

  // 2) Hay una petición en curso
  if (inflight) return inflight;

  // 3) Primera vez: obtengo la IP y la guardo
  inflight = axios
    .get<{ ip: string }>('https://api.ipify.org?format=json')
    .then(res => {
      cachedIp = res.data?.ip ?? null;
      inflight = null;
      return cachedIp;
    })
    .catch(() => {
      inflight = null;
      return null;
    });

  return inflight;
}
