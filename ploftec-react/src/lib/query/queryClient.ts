import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2, // Reintenta 2 veces si falla un fetch
      refetchOnWindowFocus: false, // No vuelve a pedir datos cuando volvés a la pestaña
      staleTime: 1000 * 60 * 5, // Los datos se consideran frescos 5 minutos
      //cacheTime: 1000 * 60 * 10, // Cachea los datos en memoria 10 minutos
    },
    mutations: {
      retry: 1, // Los POST/PUT/DELETE reintentan 1 vez si fallan
    },
  },
});
