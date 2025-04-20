// src/app/Forum/Publications/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SkeletonPublication from '@/components/skeletonComponent/skeletonPublication'
import PublicationCard from '@/components/forum/publicationCard/publicationCard'
import TopUserCard from '@/components/forum/topUserCard/topUserCard'
import { publicacionesService } from '@/lib/services/forum/publicacionesService'
import { usuariosForoService } from '@/lib/services/forum/usuariosForoService'
import { PublicationResponse, UsersForumPreviewResponse } from '@/lib/types/forum'
import { AvatarCrownEnum } from '@/lib/types/enum'
import Button from '@/components/buttonComponent/button'
import SkeletonAvatarAndName from '@/components/skeletonComponent/skeletonAvatarAndName'

export default function PublicationsPage() {
  const router = useRouter()
  const [publicaciones, setPublicaciones] = useState<PublicationResponse[]>([])
  const [usuariosTop, setUsuariosTop] = useState<UsersForumPreviewResponse[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const onNewPublication = async () => {
    // lógica para abrir modal o redireccionar
  }

  const onShowSaved = async () => {
    // lógica para ver publicaciones guardadas
  }

  const onShowCreated = async () => {
    // lógica para ver publicaciones creadas
  }

  const onSeeTopUser = async () => {
    // lógica para redirigir al perfil del usuario top
  }



  const onClickTitle = async () => {
    // lógica para ver publicaciones guardadas
  }

  const onClickUser = async () => {
    // lógica para ver publicaciones creadas
  }

  const onToggleSave = async () => {
    // lógica para redirigir al perfil del usuario top
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await publicacionesService.obtenerPublicaciones()
        const topUsers = await usuariosForoService.obtenerTopUsuariosUltimaSemana()

        setPublicaciones(result ?? [])
        setUsuariosTop(topUsers ?? [])
      } catch (error) {
        console.error('Error cargando publicaciones/top usuarios:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="slider__contents">
      <div className="forumContainer">
        <div className="forum-left">
          <div className="question-create open-modal">
            <Button executeFunction={onNewPublication} width="200px" displayText='Crear Publicación' iconClass="bx bx-plus" />
            <Button transparentContainer useIcon executeFunction={onShowSaved} width="47px" iconClass="bx bx-bookmark" displayText='' />
            <Button transparentContainer useIcon executeFunction={onShowCreated} width="47px" iconClass="bx bx-highlight" displayText='' />
          </div>

          {loading ? (
            <>
              <SkeletonPublication />
              <SkeletonPublication />
              <SkeletonPublication />
              <SkeletonPublication />
            </>
          ) : (
            publicaciones.length > 0 ? (
              publicaciones.map(pub => (
                <PublicationCard key={pub.codigoPublicacion} publication={pub} onClickTitle={onClickTitle} onClickUser={onClickUser} onToggleSave={onToggleSave} />
              ))
            ) : (
              <p>
                Aún no hay publicaciones cargadas...
                <br />
                ¡Se el primero y gana puntos!
              </p>
            )
          )}
        </div>

        <div className="forum-right">
          <div className="top-users">
            <div className="top-users-square">
              <div>
                <div className="top-users-title">Top usuarios esta semana</div>
                <div className="top-users-container">
                  <div className="top-users-elements">
                    {loading ? (
                      <>
                        <div className="top-user-skeleton">
                          <SkeletonAvatarAndName hasCrown crown={AvatarCrownEnum.gold} />
                        </div>
                        <div className="top-user-skeleton">
                          <SkeletonAvatarAndName hasCrown crown={AvatarCrownEnum.silver} />
                        </div>
                        <div className="top-user-skeleton">
                          <SkeletonAvatarAndName hasCrown crown={AvatarCrownEnum.bronze} />
                        </div>
                      </>
                    ) : (
                      usuariosTop.length > 0 ? (
                        usuariosTop.map((usuario, i) => (
                          <TopUserCard
                            //key={usuario.codigoUsuario}
                            image={usuario.image}
                            initials={usuario.iniciales}
                            shortDescription={usuario.descripcionCorta}
                            longDescription={usuario.descripcionLarga}
                            fullName={usuario.nombreCompleto}
                            score={usuario.puntaje}
                            since={usuario.fechaDesde}
                            index={i}
                            onClickName={onSeeTopUser}
                          />
                        ))
                      ) : (
                        <p>
                          Aún no hay usuarios con puntos esta semana.
                          <br />
                          ¡Se el primero!
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="top-questions">
            <div className="top-questions-square">
              <div>
                <div className="top-questions-title">Top Preguntas</div>
                <div className="top-questions-container">
                  <div className="top-questions-elements">
                    <div className="top-question">
                      <div className="top-question-text">
                        <span className="top-question-span">
                          Como hacer para que cuando haga un save changes hacerlo por partes y no todo junto?
                        </span>
                      </div>
                      <div className="top-question-user">
                        <span className="asd">
                          Que significa 2 mas 2 por 5?
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
