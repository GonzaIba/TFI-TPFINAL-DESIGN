'use client'

import { useEffect, useState } from 'react'
import { usuariosForoService } from '@/lib/services/forum/usuariosForoService'
import { UsersForumResponse, DetailsUserForumResponse } from '@/lib/types/forum'
import { getPublicationTimeAgo } from '@/lib/helpers/timeHelper'
import { initBottomSheetUsers } from '@/lib/utils/bottomSheetUsers';
import './tableUsers.css'

export default function TableUsers({ reload, onReloadCompleted }: { reload: boolean, onReloadCompleted: () => void }) {
  const [usuarios, setUsuarios] = useState<UsersForumResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<DetailsUserForumResponse | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      const result = await usuariosForoService.obtenerUsuariosForo()
      setUsuarios(result)
      setIsLoading(false)
      onReloadCompleted()
    }
    fetchUsers()
  }, [])

  const openSheet = async (email: string) => {
    const user = await usuariosForoService.obtenerDetalleUsuario(email)
    setUsuarioSeleccionado(user)
    setIsSheetOpen(true)
  }

  useEffect(() => {
    if(!isLoading) {
      import('./tableUsers.js')
    }
  }, [isLoading])

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
          ) : usuarios.length ? (
            usuarios.map((u, i) => (
              <tr key={i}>
                <td>{u.nombre}</td>
                <td>{u.puntaje}</td>
                <td>{u.fechaCreado}</td>
                <td>
                  <button className="btn-table-user" onClick={() => openSheet(u.email)}>
                    <i className="bx bx-show"></i>
                  </button>
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

      <div id="sheet" className="column items-center justify-end" aria-hidden={!isSheetOpen}>
        <div className="overlay"></div>
        <div className="contents column">
          <header className="controls">
            <div className="draggable-area">
              <div className="draggable-thumb" />
            </div>
            <button className="close-sheet" type="button" title="Close the sheet">&times;</button>
          </header>
          <main className="body fill column">
            {usuarioSeleccionado && (
              <div className="profile-container">
                <div className="profile-user-left">
                  <div className="profile-header-user-sheet">
                    <img src={usuarioSeleccionado.imageForum} alt="user" className="profile-photo-user-sheet" />
                    <h1 className="profile-name-user-sheet">{usuarioSeleccionado.nombre} {usuarioSeleccionado.apellido}</h1>
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
                      <p><strong>Puntaje:</strong> {usuarioSeleccionado.puntaje}</p>
                      <p><strong>Respuestas:</strong> {usuarioSeleccionado.cantidadRespuestas}</p>
                      <p><strong>Publicaciones:</strong> {usuarioSeleccionado.cantidadPublicacionesCreadas}</p>
                    </div>
                  </div>
                  <div className="medals-user-sheet">
                    <h2>Medallas</h2>
                    <div className="medals-user">
                      {usuarioSeleccionado.medallas?.length ? usuarioSeleccionado.medallas.map((med, i) => (
                        <div key={i} className="medals-user-container">
                          <div className="medal-card">
                            <div className="medal-message">{med.nombreMedalla}</div>
                            <div className="medal-date">{new Date(med.fechaObtenido).toLocaleDateString()}</div>
                            <div className="medal-image">
                              <img src={med.imagenMedalla} alt="medal" />
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
            )}
          </main>
        </div>
      </div>
    </div>
  )
}