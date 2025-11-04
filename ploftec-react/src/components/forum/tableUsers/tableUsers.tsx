'use client'

import { useEffect, useState, useCallback, Ref, MutableRefObject, useRef } from 'react'
import { usuariosForoService } from '@/lib/services/forum/usuariosForoService'
import { UsersForumResponse, DetailsUserForumResponse } from '@/lib/types/forum'
import { getPublicationTimeAgo } from '@/lib/helpers/timeHelper'
import DraggableBottomSheet from '@/components/draggableBottomSheet/draggableBottomSheet'
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@/components/buttonComponent/button';
import { useErrorHandler } from '@/hooks/errors/useErrorHandler'
import { useWindowWidth } from '@/hooks'
import { Colors } from '@/theme/colors'
import './tableUsers.css'

type TableUsersProps = {
  reload: boolean;
  onReloadCompleted: () => void;
  tableRef?: Ref<HTMLDivElement>;
  firstActionRef?: Ref<HTMLDivElement>;
  selectedUserEmail?: string | null;
  onUserDetailOpen?: (email: string) => void;
  onDetailClose?: () => void;
};

export default function TableUsers({
  reload,
  onReloadCompleted,
  tableRef,
  firstActionRef,
  selectedUserEmail,
  onUserDetailOpen,
  onDetailClose,
}: TableUsersProps) {
  const [usuarios, setUsuarios] = useState<UsersForumResponse[] | undefined>([])
  const [isLoading, setIsLoading] = useState(true)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<DetailsUserForumResponse | undefined>(undefined)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [isTableError, setIsTableError] = useState(false)
  const handleError = useErrorHandler();
  const [pageIndex, setPageIndex] = useState(1);
  const [pageCount, setPageCount] = useState(10);
  const currentEmailRef = useRef<string | null>(null);
  const width = useWindowWidth();
  const isMobile = width <= 768;

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setIsTableError(false)
    try {
      const result = await usuariosForoService.getUsersForum(pageIndex, pageCount)
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
  }, [pageIndex, pageCount])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    if (!reload) return
    fetchUsers().then(() => {
      onReloadCompleted()
    })
  }, [reload, fetchUsers, onReloadCompleted])

  const openDetail = useCallback(async (email: string) => {
    if (!email) return;
    currentEmailRef.current = email;
    setIsDetailOpen(true);
    setIsDetailLoading(true);
    try {
      const result = await usuariosForoService.getDetailUser(email);
      if (result.errors?.errorsList?.length > 0) {
        handleError(result.errors.errorsList);
        return;
      }
      setUsuarioSeleccionado(result.data);
    } catch {
      // errors handled globally
    } finally {
      setIsDetailLoading(false);
    }
  }, [handleError]);

  const closeDetail = useCallback((notifyParent = true) => {
    setIsDetailOpen(false);
    setUsuarioSeleccionado(undefined);
    setIsDetailLoading(false);
    currentEmailRef.current = null;
    if (notifyParent) {
      onDetailClose?.();
    }
  }, [onDetailClose]);

  const handleSelectUser = useCallback((email: string) => {
    if (!email) return;
    onUserDetailOpen?.(email);
    openDetail(email);
  }, [onUserDetailOpen, openDetail]);

  const assignFirstActionRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (!firstActionRef) return;
      if (typeof firstActionRef === 'function') {
        firstActionRef(node);
      } else {
        (firstActionRef as MutableRefObject<HTMLDivElement | null>).current = node;
      }
    },
    [firstActionRef]
  );

  useEffect(() => {
    if (!selectedUserEmail) {
      currentEmailRef.current = null;
      setIsDetailOpen(false);
      setUsuarioSeleccionado(undefined);
      setIsDetailLoading(false);
      return;
    }

    if (currentEmailRef.current === selectedUserEmail) {
      setIsDetailOpen(true);
      return;
    }

    openDetail(selectedUserEmail);
  }, [selectedUserEmail, openDetail]);

  useEffect(() => {
    if (!isDetailOpen || isMobile) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDetail();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDetailOpen, isMobile, closeDetail]);

  const renderUserDetail = () => {
    if (isDetailLoading || !usuarioSeleccionado) {
      return (
        <div className="profile-container profile-container--loading">
          <p>Cargando detalle del usuario...</p>
        </div>
      );
    }

    return (
      <div className="profile-container">
        <div className="profile-user-left">
          <div className="profile-header-user-sheet">
            <img src={usuarioSeleccionado.imageForum} alt="user" className="profile-photo-user-sheet" />
            <h1 className="profile-name-user-sheet">{usuarioSeleccionado.name} {usuarioSeleccionado.lastName}</h1>
            <p className="profile-email-user-sheet">{usuarioSeleccionado.email}</p>
            <p className="profile-last-connected">
              <strong>Ultima vez conectado:</strong> {getPublicationTimeAgo('', new Date(usuarioSeleccionado.lastTimeConnectedForum))}
            </p>
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
            <h2>Estadisticas</h2>
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
                  <div className="no-medals-message">Este usuario aun no tiene medallas.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="table-users" ref={tableRef}>
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
                    <div className="details">
                      <span className="title-skeleton" style={{ borderRadius: 8, width: '100%' }} />
                    </div>
                  </td>
                ))}
              </tr>
            ))
          ) : isTableError ? (
            <tr>
              <td colSpan={4} className="empty-state">
                <div className="empty-container">
                  <i className="bx bx-error" style={{ fontSize: '2rem', color: '#999' }}></i>
                  <p>Ocurrio un error al obtener los usuarios.</p>
                </div>
              </td>
            </tr>
          )
          : usuarios && usuarios.length ? (
            usuarios.map((u, i) => (
              <tr key={i}>
                <td>{u.name}</td>
                <td>{u.score}</td>
                <td>{
                  typeof u.createdDate === 'string'
                    ? (u.createdDate as string).substring(0, 10)
                    : u.createdDate instanceof Date
                      ? u.createdDate.toISOString().substring(0, 10)
                      : ''
                }</td>
                <td>
                  <div
                    ref={i === 0 ? assignFirstActionRef : undefined}
                  >
                    <Button
                      onClick={() => handleSelectUser(u.email)}
                      icon={<VisibilityIcon sx={{ color: Colors.white }} fontSize='medium' />}
                      transparent
                      circular
                      width="45px"
                    />
                  </div>
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

      {isMobile && isDetailOpen && (
        <DraggableBottomSheet isOpen={isDetailOpen} onClose={() => closeDetail()}>
          {renderUserDetail()}
        </DraggableBottomSheet>
      )}

      {!isMobile && isDetailOpen && (
        <div className="user-detail-modal" role="dialog" aria-modal="true">
          <div className="user-detail-modal__backdrop" onClick={() => closeDetail()} />
          <div className="user-detail-modal__panel">
            <button
              type="button"
              className="user-detail-modal__close"
              onClick={() => closeDetail()}
              aria-label="Cerrar detalle de usuario"
            >
              <CloseIcon />
            </button>
            <div className="user-detail-modal__content">
              {renderUserDetail()}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
