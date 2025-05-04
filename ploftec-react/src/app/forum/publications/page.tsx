// src/app/Forum/Publications/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import SkeletonAvatarAndName from '@/components/skeletonComponent/skeletonAvatarAndName'
import SkeletonPublication from '@/components/skeletonComponent/skeletonPublication'
import PublicationCard from '@/components/forum/publicationCard/publicationCard'
import PublicationDetailCard from '@/components/forum/publicationDetail/publicationDetail'
import AnswerCard from '@/components/forum/answerCard/answerCard'
import TopUserCard from '@/components/forum/topUserCard/topUserCard'
import Button from '@/components/buttonComponent/button'
import { publicacionesService } from '@/lib/services/forum/publicacionesService'
import { usuariosForoService } from '@/lib/services/forum/usuariosForoService'
import { PublicationResponse, UsersForumPreviewResponse, PublicationDetailResponse } from '@/lib/types/forum'
import { AvatarCrownEnum } from '@/lib/types/enum'
import { Add, Bookmark, BookmarkBorder, BorderColor, BorderColorOutlined } from '@mui/icons-material';
import { Colors } from '@/theme/colors'

export default function PublicationsPage() {
  const router = useRouter()
  const [publicaciones, setPublicaciones] = useState<PublicationResponse[]>([])
  const [usuariosTop, setUsuariosTop] = useState<UsersForumPreviewResponse[]>([])
  const [loadingPubs, setLoadingPubs] = useState<boolean>(true)
  const [loadingTopUsers, setLoadingTopusers] = useState<boolean>(true)
  const [showPublicationDetail, setShowPublicationDetail] = useState(false)
  const [currentPublication, setCurrentPublication] = useState<PublicationDetailResponse>()
  const [showSaved, setShowSaved] = useState(false);
  const [showCreated, setChowCreated] = useState(false);


  const onNewPublication = async () => {
    // lógica para abrir modal o redireccionar
  }

  const onShowSaved = async () => {
    setShowSaved(!showSaved)
    setLoadingPubs(true);

    let publicationsSaved: PublicationResponse[];
    if(!showSaved)
      publicationsSaved = await publicacionesService.obtenerPublicacionesGuardadas();
    else
      publicationsSaved = await publicacionesService.obtenerPublicaciones();

    setPublicaciones(publicationsSaved);
    setLoadingPubs(false);
  }

  const onShowCreated = async () => {
    setChowCreated(!showCreated)
    setLoadingPubs(true);

    let publicationsSaved: PublicationResponse[];
    if(!showCreated)
      publicationsSaved = await publicacionesService.obtenerPublicacionesCreadas();
    else
      publicationsSaved = await publicacionesService.obtenerPublicaciones();

    setPublicaciones(publicationsSaved);
    setLoadingPubs(false);
  }

  const onSeeTopUser = async () => {
    // lógica para redirigir al perfil del usuario top
  }



  const onClickUser = async () => {
    // lógica para ver publicaciones creadas
  }

  const onToggleSave = async (codePub: number, isSaved: boolean) => {
    // lógica para redirigir al perfil del usuario top
    //revisar casuistica cuando falla el guardado de la publi
    setLoadingPubs(true);
    let result: any;
    if (isSaved) {
      result = await publicacionesService.eliminarPublicacionGuardada(codePub);
    } else {
      result = await publicacionesService.guardarPublicacion(codePub);
    }

    if(result){
      setPublicaciones(await publicacionesService.obtenerPublicaciones());
    }
    setLoadingPubs(false);
  }

  const onClickTitle = async (codigoPublicacion: number) => {
    try {
      setShowPublicationDetail(true)
      setLoadingPubs(true)
      const detail = await publicacionesService.obtenerDetallePublicacion(codigoPublicacion)
      setCurrentPublication(detail)
    } catch (error) {
      console.error('Error al obtener detalle de publicación:', error)
    } finally {
      setLoadingPubs(false)
    }
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
        setLoadingPubs(false)
        setLoadingTopusers(false)
      }
    }

    fetchData()
  }, [])

  const handleBackToPublications = async () => {
    setShowPublicationDetail(false)
    setCurrentPublication(undefined)
    //await fetchPublications()
  }

  return (
    <div className="slider__contents">
      {!showPublicationDetail ? (
      <div className="forumContainer">
        <div className="forum-left">
        <div className="question-create open-modal">
        <Button
          text="Crear Publicación"
          onClick={onNewPublication}
          icon={<Add fontSize='medium' />}
          width="200px"
        />
        <Button
          onClick={onShowSaved}
          icon={showSaved ? <Bookmark sx={{ color: Colors.primary }} fontSize='medium' /> : <BookmarkBorder sx={{ color: Colors.white }} fontSize='medium' />}
          transparent
          width="40px"
        />
        <Button
          onClick={onShowCreated}
          icon={showCreated ? <BorderColor sx={{ color: Colors.primary }} fontSize='medium' /> : <BorderColorOutlined sx={{ color: Colors.white }} fontSize='medium' />}
          transparent
          width="40px"
        />
      </div>
      {loadingPubs ? (
        <>
          <SkeletonPublication />
          <SkeletonPublication />
          <SkeletonPublication />
          <SkeletonPublication />
        </>
      ) : (
        publicaciones.length > 0 ? (
          publicaciones.map(pub => (
            <PublicationCard 
              key={`${pub.codigoPublicacion}-${pub.codigoUsuario}`}                  
              publication={pub} 
              onClickTitle={async () => onClickTitle(pub.codigoPublicacion)} 
              onClickUser={onClickUser}
              onToggleSave={async () => onToggleSave(pub.codigoPublicacion, pub.estaGuardado)} 
            />
          ))
        ) : showCreated ? (
          <p>
          Aún no tenes publicaciones creadas
          <br />
          Crealo y gana puntos!
        </p>
        ) :(
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
                    {loadingTopUsers ? (
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
                            key={usuario.fechaDesde}
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
      ) : (
        currentPublication && (
          <PublicationDetailCard
            publication={currentPublication}
            onBack={handleBackToPublications}
            onAddAnswer={async () => {}}
            onVotePublication={async () => {}}
          />
        )
      )}
    </div>
  )
}
