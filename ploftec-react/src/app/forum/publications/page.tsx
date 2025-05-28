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
import { publicationsService } from '@/lib/services/forum/publicationsService'
import { usuariosForoService } from '@/lib/services/forum/usuariosForoService'
import { PublicationResponse, UsersForumPreviewResponse, PublicationDetailResponse, AddAnswerRequest } from '@/lib/types/forum'
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
      publicationsSaved = await publicationsService.getSavedPublications();
    else
      publicationsSaved = await publicationsService.getPublications();

    setPublicaciones(publicationsSaved);
    setLoadingPubs(false);
  }

  const onShowCreated = async () => {
    setChowCreated(!showCreated)
    setLoadingPubs(true);

    let publicationsSaved: PublicationResponse[];
    if(!showCreated)
      publicationsSaved = await publicationsService.getCreatedPublications();
    else
      publicationsSaved = await publicationsService.getPublications();

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
      result = await publicationsService.deleteSavedPublication(codePub);
    } else {
      result = await publicationsService.savePublication(codePub);
    }

    if(result){
      setPublicaciones(await publicationsService.getPublications());
    }
    setLoadingPubs(false);
  }

  const onClickTitle = async (codigoPublicacion: number) => {
    try {
      setShowPublicationDetail(true)
      setLoadingPubs(true)
      const detail = await publicationsService.getDetailPublication(codigoPublicacion)
      setCurrentPublication(detail)
    } catch (error) {
      console.error('Error al obtener detalle de publicación:', error)
    } finally {
      setLoadingPubs(false)
    }
  }
  
  const handleBackToPublications = async () => {
    setShowPublicationDetail(false)
    setCurrentPublication(undefined)
    //await fetchPublications()
  }

  const handleOnAddAnswer = async (request: AddAnswerRequest) => {
    try {
      setLoadingPubs(true)
      const result = await publicationsService.addAnswer(request)
      console.log('Respuesta agregada:', result)
      if (result) {
        // Actualizar la publicación actual con la nueva respuesta
        console.log('Respuesta agregada, enter iffff', result)
        const updatedPublication = await publicationsService.getDetailPublication(request.codePublication)
        console.log('upd pub', updatedPublication)
        setCurrentPublication(updatedPublication)
      }
    } catch (error) {
      console.error('Error al agregar respuesta:', error)
    }
    finally {
      setLoadingPubs(false)
    }
  }
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await publicationsService.getPublications()
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
  
  
  console.log('Page publications Main:')
  
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
              key={`${pub.codePublication}-${pub.codeUser}`}                  
              publication={pub} 
              onClickTitle={async () => onClickTitle(pub.codePublication)} 
              onClickUser={onClickUser}
              onToggleSave={async () => onToggleSave(pub.codePublication, pub.isSaved)} 
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
                            key={`${usuario.dateFrom}-${usuario.initials}`}
                            image={usuario.image}
                            initials={usuario.initials}
                            shortDescription={usuario.shortDescription}
                            longDescription={usuario.longDescription}
                            fullName={usuario.completeName}
                            score={usuario.score}
                            since={usuario.dateFrom}
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
            onAddAnswer={handleOnAddAnswer}
          />
        )
      )}
    </div>
  )
}
