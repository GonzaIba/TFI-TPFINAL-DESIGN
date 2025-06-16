// lib/query/hooks/useTopUsers.ts
import { usuariosForoService } from '@/lib/services/forum/usuariosForoService'
import { usersKeys } from '../../keys'
import { useQuery } from '@tanstack/react-query'

export function useTopUsers() {
  return useQuery({
    queryKey: usersKeys.topWeek(),
    queryFn: usuariosForoService.getTopUsersLastWeek,
    select: res => res.data ?? [],
  })
}