'use client'

import { useEffect, useState, useCallback } from 'react'
import { usuariosForoService } from '@/lib/services/forum/usuariosForoService'
import { UsersForumResponse, DetailsUserForumResponse } from '@/lib/types/forum'
import { getPublicationTimeAgo } from '@/lib/helpers/timeHelper'
import DraggableBottomSheet from '@/components/draggableBottomSheet/draggableBottomSheet'
import VisibilityIcon from '@mui/icons-material/Visibility';
import Button from "@/components/buttonComponent/button";
import { useErrorHandler } from '@/hooks/errors/useErrorHandler'
import { Colors } from '@/theme/colors'
import './tableUsers.css'

export default function TableUsers({ reload, onReloadCompleted }: { reload: boolean, onReloadCompleted: () => void }) {
  const [usuarios, setUsuarios] = useState<UsersForumResponse[] | undefined>([])
  const [isLoading, setIsLoading] = useState(true)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<DetailsUserForumResponse | undefined>(undefined)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isTableError, setIsTableError] = useState(false)
  const handleError = useErrorHandler();
  const [pageIndex, setPageIndex] = useState(1);
  const [pageCount, setPageCount] = useState(10);

  // 1) Función de fetch aislada (no llama a onReloadCompleted aquí)
  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setIsTableError(false)
    try {
      const result = await usuariosForoService.obtenerUsuariosForo(pageIndex, pageCount)
      if (result.errors?.errorsList?.length) {
        setIsTableError(true)
      } else {
        setUsuarios(result?.data?.list ?? [])
      }
    } catch {
      setIsTableError(true)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // 2) Fetch inicial en mount
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // 3) Fetch al cambiar `reload` a true, y reseteo con onReloadCompleted
  useEffect(() => {
    if (!reload) return
    fetchUsers().then(() => {
      onReloadCompleted()
    })
  }, [reload, fetchUsers, onReloadCompleted])

  const openSheet = async (email: string) => {
    setIsSheetOpen(true)
    const result = await usuariosForoService.obtenerDetalleUsuario(email)

    //no manejar error asi solo aca
    if (result.errors?.errorsList?.length > 0) {
      handleError(result.errors.errorsList);
      return;
    }

    setUsuarioSeleccionado(result.data)
  }

  const closeSheet = () => {
    setIsSheetOpen(false)
    setUsuarioSeleccionado(undefined)
  }

  return (
    <div className="table-users">
      <table className="table-fixed">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Puntaje</th>
            <th>Unido desde</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <tr key={i}>
                {[...Array(4)].map((_, j) => (
                  <td key={j} className="td-skeleton">
                    <div className="details"><span className="title-skeleton" style={{ borderRadius: 8, width: '100%' }} /></div>
                  </td>
                ))}
              </tr>
            ))
          ) : isTableError ? (
            <tr>
              <td colSpan={4} className="empty-state">
                <div className="empty-container">
                  <i className="bx bx-error" style={{ fontSize: '2rem', color: '#999' }}></i>
                  <p>Ocurrió un error al obtener los usuarios.</p>
                </div>
              </td>
            </tr>
          )
          : usuarios && usuarios.length ? (
            usuarios.map((u, i) => (
              <tr key={i}>
                <td>{u.name}</td>
                <td>{u.score}</td>
                <td>{u.createdDate.substring(0, 10)}</td>
                <td>

                  <Button
                    onClick={() => openSheet(u.email)}
                    icon={<VisibilityIcon sx={{ color: Colors.white }} fontSize='medium'/>}
                    transparent
                    circular
                    width="45px"
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="empty-state">
                <div className="empty-container">
                  <i className="bx bx-folder-open" style={{ fontSize: '2rem', color: '#999' }}></i>
                  <p>No se encontraron usuarios en el foro.</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {isSheetOpen && (
        <DraggableBottomSheet isOpen={isSheetOpen} onClose={() => closeSheet()}>
          {usuarioSeleccionado ? (
          <div className="profile-container">
            <div className="profile-user-left">
              <div className="profile-header-user-sheet">
                <img src={usuarioSeleccionado.imageForum} alt="user" className="profile-photo-user-sheet" />
                <h1 className="profile-name-user-sheet">{usuarioSeleccionado.name} {usuarioSeleccionado.lastName}</h1>
                <p className="profile-email-user-sheet">{usuarioSeleccionado.email}</p>
                <p className="profile-last-connected"><strong>Última vez conectado:</strong> {getPublicationTimeAgo('', new Date(usuarioSeleccionado.lastTimeConnectedForum))}</p>
                <div className="profile-buttons-user-sheet">
                  <button className="button-updates-user-sheet">Qualified for Updates</button>
                  <button className="button-trials-user-sheet">Trials</button>
                </div>
              </div>
              <div className="profile-details-user-sheet">
                <h2 style={{ color: 'black' }}>Acerca de</h2>
                <p>{usuarioSeleccionado.longDescriptionForum}</p>
              </div>
            </div>
            <div className="profile-user-right">
              <div className="user-properties-user-sheet">
              <h2>Estadísticas</h2>
              <div className="profile-user-stadistics">
                  <p><strong>Puntaje:</strong> {usuarioSeleccionado.score}</p>
                  <p><strong>Respuestas:</strong> {usuarioSeleccionado.quantityResponses}</p>
                  <p><strong>Publicaciones:</strong> {usuarioSeleccionado.numberPostsCreated}</p>
              </div>
              </div>
              <div className="medals-user-sheet">
              <h2>Medallas</h2>
              <div className="medals-user">
                  {usuarioSeleccionado.medals?.length ? usuarioSeleccionado.medals.map((med, i) => (
                  <div key={i} className="medals-user-container">
                      <div className="medal-card">
                      <div className="medal-message">{med.nameMedal}</div>
                      <div className="medal-date">{new Date(med.dateObtained).toLocaleDateString()}</div>
                      <div className="medal-image">
                          <img src={med.imageMedal} alt="medal" />
                      </div>
                      </div>
                  </div>
                  )) : (
                  <div className="no-medals-card">
                      <div className="no-medals-message">Este usuario aún no tiene ninguna medalla.</div>
                  </div>
                  )}
              </div>
              </div>
            </div>
          </div>
          ) : (
            <div className="profile-container">
              
            </div>
          )}
        </DraggableBottomSheet>
      )}    
    </div>
  )
}