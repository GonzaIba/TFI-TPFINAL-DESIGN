// src/app/Forum/Publications/page.tsx

'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { SkeletonPublication, SkeletonAvatarAndName, SkeletonCircle, SkeletonAnswerCard, SkeletonEditorComment } from '@/components'
import PublicationCard from '@/components/forum/publicationCard/publicationCard'
import PublicationDetailCard from '@/components/forum/publicationDetail/publicationDetail'
import TopUserCard from '@/components/forum/topUserCard/topUserCard'
import Button from '@/components/buttonComponent/button'
import { useErrorHandler } from '@/hooks/errors/useErrorHandler'
import { publicationsService } from '@/lib/services/forum/publicationsService'
import { usuariosForoService } from '@/lib/services/forum/usuariosForoService'
import { PublicationResponse, UsersForumPreviewResponse, PublicationDetailResponse, AddAnswerRequest } from '@/lib/types/forum'
import { AvatarCrownEnum } from '@/lib/types/enum'
import { Add, Bookmark, BookmarkBorder, BorderColor, BorderColorOutlined } from '@mui/icons-material';
import { Colors } from '@/theme/colors'
import { motion, AnimatePresence } from 'framer-motion';

export default function PublicationsPage() {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const [publicaciones, setPublicaciones] = useState<PublicationResponse[]>([])
  const [currentPublication, setCurrentPublication] = useState<PublicationDetailResponse>()
  const [usuariosTop, setUsuariosTop] = useState<UsersForumPreviewResponse[]>([])
  const [loadingPubs, setLoadingPubs] = useState<boolean>(true)
  const [loadingTopUsers, setLoadingTopusers] = useState<boolean>(true)
  const [showPublicationDetail, setShowPublicationDetail] = useState(false)
  const [showSaved, setShowSaved] = useState(false);
  const [showCreated, setChowCreated] = useState(false);
  const [selectedPublicationId, setSelectedPublicationId] = useState<number | null>(null);

  const handleError = useErrorHandler();
  const onNewPublication = async () => {
    // lógica para abrir modal o redireccionar
  }

  const onShowSaved = async () => {
    setShowSaved(!showSaved)
    setLoadingPubs(true);

    let publicationsSaved: PublicationResponse[];
    if(!showSaved)
      publicationsSaved = (await publicationsService.getSavedPublications()).data as PublicationResponse[];
    else
      publicationsSaved = (await publicationsService.getPublications()).data as PublicationResponse[];

    setPublicaciones(publicationsSaved);
    setLoadingPubs(false);
  }

  const onShowCreated = async () => {
    setChowCreated(!showCreated)
    setLoadingPubs(true);

    let publicationsSaved: PublicationResponse[];
    if(!showCreated)
      publicationsSaved = (await publicationsService.getCreatedPublications()).data as PublicationResponse[];
    else
      publicationsSaved = (await publicationsService.getPublications()).data as PublicationResponse[];

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
    // setLoadingPubs(true);
    let result: any;
    if (isSaved) {
      result = await publicationsService.deleteSavedPublication(codePub);
    } else {
      result = await publicationsService.savePublication(codePub);
    }

    setPublicaciones(prevPubs =>
      prevPubs.map(pub =>
        pub.codePublication === codePub
          ? { ...pub, isSaved: !pub.isSaved }
          : pub)
    )

    // if(result){
    //   setPublicaciones(await publicationsService.getPublications());
    // }
    // setLoadingPubs(false);
  }

  const onClickTitle = (codigo: number) => {
    setCurrentPublication(undefined);
    setShowPublicationDetail(true);
    setSelectedPublicationId(codigo); // se usará después
  };

  const fetchPublicationDetail = async (codigo: number) => {
    try {
      const response = await publicationsService.getDetailPublication(codigo);
      if (response.errors?.errorsList?.length > 0) {
        handleError(response.errors.errorsList);
        return;
      }

      setCurrentPublication(response.data as PublicationDetailResponse);
    } catch (error) {
        console.error('Error al obtener detalle de publicación:', error);
    }
  };
  
  const handleBackToPublications = async () => {
    setShowPublicationDetail(false)
    setCurrentPublication(undefined)
    //await fetchPublications()
  }
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await publicationsService.getPublications()
        const response = await usuariosForoService.obtenerTopUsuariosUltimaSemana()
        if (response.errors?.errorsList?.length > 0) {
          handleError(response.errors.errorsList);
          return;
        }
        setPublicaciones(result.data ?? [])
        setUsuariosTop(response.data ?? [])
      } catch (error) {
        console.error('Error cargando publicaciones/top usuarios:', error)
      } finally {
        setLoadingPubs(false)
        setLoadingTopusers(false)
      }
    }
    
    fetchData()
  }, [])
  
  // console.log('Page publications Main:')
  
  return (
    <div className="slider__contents">
      <AnimatePresence mode="wait">
        {!showPublicationDetail ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%', height: '100%' }}
          >
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
              <AnimatePresence mode="wait">
                {publicaciones.map((pub, i) => (
                  <motion.div
                    key={`${pub.codePublication}-${pub.codeUser}`}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{
                      duration: 0.7,
                      delay: i * 0.1,
                      ease: 'easeOut'
                    }}
                  >
                    <PublicationCard 
                      publication={pub} 
                      onClickTitle={async () => onClickTitle(pub.codePublication)} 
                      onClickUser={onClickUser}
                      onToggleSave={async () => onToggleSave(pub.codePublication, pub.isSaved)} 
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
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
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%', height: '100%' }}
            onAnimationComplete={() => {
              if (selectedPublicationId !== null && currentPublication === undefined) {
                fetchPublicationDetail(selectedPublicationId);
              }
            }}
          >
            <PublicationDetailCard
              publication={currentPublication}
              onBack={handleBackToPublications}
              scrollRef={scrollRef}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
