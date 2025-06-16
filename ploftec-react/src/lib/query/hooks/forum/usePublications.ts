// lib/query/hooks/usePublications.ts
import { useQuery } from '@tanstack/react-query'
import { publicationsService } from '@/lib/services/forum/publicationsService'
import { publicationsKeys } from '../../keys'

export function usePublications() {
  return useQuery({
    queryKey: publicationsKeys.list(),
    queryFn: publicationsService.getPublications,
    select: res => res.data ?? [],          // ⬅️ dejás solo el array
    /*onError: (err: any) => {
      // Si tu servicio ya normaliza errores, simplemente lánzalos
      // o llama a tu handleError aquí:
      // handleError(err?.errors?.errorsList ?? err);
    },*/
  })
}
