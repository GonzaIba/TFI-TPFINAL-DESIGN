'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/buttonComponent/button'
import ProtectedRoute from "@/components/auth/protectedRoute";
import { usuariosForoService } from '@/lib/services/forum/usuariosForoService'
import { UserFilterForumResponse } from '@/lib/types/forum'
import SideBarFilters from '@/components/sidebarFiltersComponent/sidebarFilters'
import TableUsers from '@/components/forum/tableUsers/tableUsers'
import { GroupEnum } from '@/lib/types/enum'
import styles from './page.module.css'

export default function UsersPage() {
  const [showUserFilters, setShowUserFilters] = useState(false)
  const [userFilters, setUserFilters] = useState<UserFilterForumResponse[]>([])
  const [shouldReloadUsers, setShouldReloadUsers] = useState(false)

  useEffect(() => {
    const loadFilters = async () => {
      const filtros = (await usuariosForoService.obtenerFiltrosUsuario()).data
      setUserFilters(filtros ?? [])
    }
    loadFilters()
  }, [])

  const handleManageFilters = async () => {
    setShowUserFilters(prev => !prev)
  }

  const handleGuardarFiltrosUsuario = async (valuePairs: Record<number, string>) => {
    const filtered = Object.fromEntries(
      Object.entries(valuePairs).filter(([_, v]) => v.trim() !== '')
    )
    await usuariosForoService.agregarFiltrosUsuario({ filters_CodeValue: filtered })
    const nuevosFiltros = (await usuariosForoService.obtenerFiltrosUsuario()).data
    setUserFilters(nuevosFiltros ?? [])
    setShouldReloadUsers(true)
  }

  const handleResetearFiltros = async () => {
    if(userFilters.length > 0) {
      await usuariosForoService.eliminarFiltroUsuario(GroupEnum.ForumUserTable)
      const filtrosActualizados = (await usuariosForoService.obtenerFiltrosUsuario()).data
      setUserFilters(filtrosActualizados ?? [])
      setShouldReloadUsers(true)
    }
  }

  const handleEliminarFiltro = async (codigoFiltro: number) => {
    await usuariosForoService.eliminarFiltroUsuario(codigoFiltro)
    const filtrosActualizados = (await usuariosForoService.obtenerFiltrosUsuario()).data
    setUserFilters(filtrosActualizados ?? [])
    setShouldReloadUsers(true)
  }

  return (
    <div className="slider__contents">
      <div className={styles.forumContainer}>
        <div className={styles.forumCenter}>
          <div className={styles.userPanelContainer}>
            <div className={styles.userProfiles}>
              <div className={styles.userPanelTitle}>
                <div className={styles.userTitle}>
                  <h2>All Users</h2>
                </div>
                <div className={styles.userTitleSettings}>
                  <i className="fa fa-cog" aria-hidden="true"></i>
                  Configuración
                </div>
              </div>
              <div className={styles.userSearch}>
                <div className={styles.userPanelButtonsContainer}>
                <Button
                onClick={handleManageFilters}
                text="Filtrar Por"
                />
                </div>
              </div>
              <div className={styles.userFilters}>
                {userFilters.map(item => (
                  <span key={item.codeFilter} className={styles.userFiltersTag}>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleEliminarFiltro(item.codeFilter)}
                    >
                      &times;
                    </button>
                    {item.description}: {item.value}
                  </span>
                ))}
              </div>
              <TableUsers reload={shouldReloadUsers} onReloadCompleted={() => setShouldReloadUsers(false)} />
            </div>
          </div>
        </div>
      </div>
      <SideBarFilters
        show={showUserFilters}
        closeFunction={handleManageFilters}
        saveFunction={handleGuardarFiltrosUsuario}
        resetFunction={handleResetearFiltros}
        onCompleted={handleManageFilters}
        grupo={GroupEnum.ForumUserTable}
      />
    </div>
  )
}
