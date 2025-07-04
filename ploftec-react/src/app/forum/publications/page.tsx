// src/app/Forum/Publications/page.tsx
'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  SkeletonPublication, 
  SkeletonAvatarAndName, 
  PanelSection, 
  TopPublicationCard, 
  SkeletonLine,
  ModalComponent,
  Button,
  Paginator
} from '@/components'
import PublicationCard from '@/components/forum/publicationCard/publicationCard'
import PublicationDetailCard from '@/components/forum/publicationDetail/publicationDetail'
import CreatePublicationComponent from '@/components/forum/createPublicationModal/createPublicationModal'
import TopUserCard from '@/components/forum/topUserCard/topUserCard'
import { useErrorHandler } from '@/hooks/errors/useErrorHandler'
import { publicationsService } from '@/lib/services/forum/publicationsService'
import { PublicationResponse, PublicationDetailResponse, CreatePublicationRequest } from '@/lib/types/forum'
import { AvatarCrownEnum } from '@/lib/types/enum'
import { Add, Bookmark, BookmarkBorder, BorderColor, BorderColorOutlined } from '@mui/icons-material';
import { Colors } from '@/theme/colors'
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { publicationsKeys } from '@/lib/query/keys';
import { useWindowWidth } from '@/hooks';
import {
  usePublications,
  useTopPublications,
  useTopUsers,
  useSavedPublications,
  useCreatedPublications,
} from '@/lib/query/hooks';

type Filter = 'all' | 'saved' | 'created';

export default function PublicationsPage() {
  const router = useRouter()
  const scrollRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const [currentPublication, setCurrentPublication] = useState<PublicationDetailResponse>()
  const [relatedPublications, setRelatedPublications] = useState<PublicationResponse[]>()
  const [showPublicationDetail, setShowPublicationDetail] = useState(false)
  const [loadingCreatePublication, setLoadingCreatePublication] = useState(false)
  const [selectedPublicationId, setSelectedPublicationId] = useState<number | null>(null);
  const [showModalNewPub, setShowModalNewPub] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');
  const [pages, setPages] = useState<{ [key in Filter]: number }>({
    all: 1,
    saved: 1,
    created: 1,
  })
  const currentPage = pages[filter]
  const postsPerPage = 3

  const width = useWindowWidth();
  const [isMobile, setIsMobile] = useState(width < 768)

  useEffect(() => {
    setIsMobile(width < 768)
  }, [width])

  /* ---------- Queries ---------- */
  const {
    data: paginatedPubs,
    isLoading: loadingAll,
    isFetching: fetchingAll,
  } = usePublications(currentPage, postsPerPage)

  const {
    data: paginatedSaved,
    isLoading: loadingSaved,
    isFetching: fetchingSaved,
  } = useSavedPublications(filter === 'saved', currentPage, postsPerPage)

  const {
    data: paginatedCreated,
    isLoading: loadingCreated,
  } = useCreatedPublications(filter === 'created', currentPage, postsPerPage)

  // determinar datos y totalPages según filtro
  const publicacionesData =
    filter === 'all'
      ? paginatedPubs?.list ?? []
      : filter === 'saved'
      ? paginatedSaved?.list ?? []
      : paginatedCreated?.list ?? []

  const totalPages =
    filter === 'all'
      ? paginatedPubs?.totalPages ?? 1
      : filter === 'saved'
      ? paginatedSaved?.totalPages ?? 1
      : paginatedCreated?.totalPages ?? 1

  const loadingPubs =
    filter === 'all'
      ? loadingAll || fetchingAll
      : filter === 'saved'
      ? loadingSaved || fetchingSaved
      : loadingCreated

  const {
    data: publicacionesTop = [],
    isLoading: loadingTopPubs,
  } = useTopPublications();

  const {
    data: usuariosTop = [],
    isLoading: loadingTopUsers,
  } = useTopUsers();

  const isPageLoading =
    (filter === 'all' && (loadingAll || fetchingAll)) ||
    (filter === 'saved' && loadingSaved) ||
    (filter === 'created' && loadingCreated) ||
    loadingTopPubs ||
    loadingTopUsers

  const handleError = useErrorHandler();
  const queryClient = useQueryClient();

  const toggleFilter = (f: Filter) => {
    setFilter(prev => (prev === f ? 'all' : f));   // si vuelven a pulsar, vuelve a 'all'
  };

  const onPageChange = (newPage: number) => {
    setPages(prev => ({ ...prev, [filter]: newPage }))
  }

  const { mutate: toggleSave } = useMutation({
    mutationFn: async ({ codePub, isSaved }: { codePub: number; isSaved: boolean }) =>
      isSaved
        ? publicationsService.deleteSavedPublication(codePub)
        : publicationsService.savePublication(codePub),

    onSuccess: () => {
      // refrescamos las listas afectadas:
      queryClient.invalidateQueries({ queryKey: publicationsKeys.list(currentPage, postsPerPage) });
      queryClient.invalidateQueries({ queryKey: publicationsKeys.saved(currentPage, postsPerPage) });
    },

    onError: handleError,
  });

  const onNewPublication = async () => {
    // lógica para abrir modal o redireccionar
    setShowModalNewPub(true)
  }

  const onSeeTopUser = async () => {
    // lógica para redirigir al perfil del usuario top
  }

  const onClickUser = async () => {
    // lógica para ver publicaciones creadas
  }

  const onClickTitle = (codigo: number) => {
    setCurrentPublication(undefined);
    setRelatedPublications(undefined)
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

      const response2 = await publicationsService.getRelatedPublications(codigo);
      if (response2.errors?.errorsList?.length > 0) {
        handleError(response2.errors.errorsList);
        return;
      }

      setRelatedPublications(response2.data)
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

  const handleOnCreatePublication = async (data : CreatePublicationRequest) => {
    try {
      setLoadingCreatePublication(true);
      await publicationsService.createPublication(data);
    } catch(error) {
      console.error(error)
    } finally {
      setLoadingCreatePublication(false);
      setShowModalNewPub(false);
    }
  }

  const onClicRelatedPub = async (codigo: number) => {
    setCurrentPublication(undefined)
    setRelatedPublications(undefined)
    await fetchPublicationDetail(codigo)
  }
  
  // console.log('Page publications Main:')
  
  return (
    <div className="slider__contents">
      <AnimatePresence mode="wait">
        {showPublicationDetail ? (
          /* ——— VISTA DETALLE ——— */
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
              relatedPublications={relatedPublications}
              onClicRelatedPub={onClicRelatedPub}
              onBack={handleBackToPublications}
              scrollRef={scrollRef}
            />
          </motion.div>
        ) : (
          /* ——— VISTA LISTA ——— */
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.4 }}
            style={{ width: '100%', height: '100%' }}
          >
            <div className="forumContainer">
              {/* —————— Lado izquierdo —————— */}
              <div className="forum-left">
                <div className="question-create open-modal">
                  <Button
                    text="Crear Publicación"
                    onClick={onNewPublication}
                    icon={<Add fontSize="medium" />}
                    width="200px"
                  />

                  {/* Guardadas */}
                  <Button
                    onClick={() => toggleFilter('saved')}
                    icon={
                      filter === 'saved' ? (
                        <Bookmark sx={{ color: Colors.primary }} fontSize="medium" />
                      ) : (
                        <BookmarkBorder sx={{ color: Colors.white }} fontSize="medium" />
                      )
                    }
                    transparent
                    width="40px"
                  />

                  {/* Creadas */}
                  <Button
                    onClick={() => toggleFilter('created')}
                    icon={
                      filter === 'created' ? (
                        <BorderColor sx={{ color: Colors.primary }} fontSize="medium" />
                      ) : (
                        <BorderColorOutlined sx={{ color: Colors.white }} fontSize="medium" />
                      )
                    }
                    transparent
                    width="40px"
                  />
                </div>

                {/* ––– LISTA PUBLICACIONES ––– */}
                {loadingPubs ? (
                  <>
                    <SkeletonPublication />
                    <SkeletonPublication />
                    <SkeletonPublication />
                    <SkeletonPublication />
                  </>
                ) : publicacionesData?.length ? (
                  publicacionesData?.map((pub, i) => (
                    <motion.div
                      key={`${pub.codePublication}-${pub.codeUser}`}
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.7, delay: i * 0.1, ease: 'easeOut' }}
                    >
                      <PublicationCard
                        publication={pub}
                        onClickTitle={async () => onClickTitle(pub.codePublication)}
                        onClickUser={onClickUser}
                        onToggleSave={async () => {
                          toggleSave({ codePub: pub.codePublication, isSaved: pub.isSaved })
                        }}
                      />
                    </motion.div>
                  ))
                ) : filter === 'created' ? (
                  <p>Aún no tenés publicaciones creadas…</p>
                ) : (
                  <p>Aún no hay publicaciones cargadas…</p>
                )}

                <Paginator
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={onPageChange}
                  isComponentLoading={isPageLoading}
                />
              </div>

              {/* —————— Lado derecho (top-users y top-questions) —————— */}
              <div className="forum-right">
                
                <PanelSection
                  title="Top usuarios esta semana"
                  items={usuariosTop}
                  loading={loadingTopUsers}
                  getKey={(usuario) => `${usuario.dateFrom}-${usuario.completeName}`}
                  /* ---------- loading ---------- */
                  renderLoading={(
                    <>
                      {(['gold', 'silver', 'bronze'] as Array<keyof typeof AvatarCrownEnum>).map((crown, i) => (
                        <div key={crown} className="top-user-skeleton">
                          <SkeletonAvatarAndName hasCrown crown={AvatarCrownEnum[crown]} />
                        </div>
                      ))}
                    </>
                  )}
                  /* ---------- item ---------- */
                  renderItem={(usuario, i) => (
                    <TopUserCard
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
                  )}
                  /* ---------- vacío ---------- */
                  emptyMessage={
                    <p>
                      Aún no hay usuarios con puntos esta semana.
                      <br />
                      ¡Sé el primero!
                    </p>
                  }
                />

                <PanelSection
                  isDownCard
                  title="Top Preguntas esta semana"
                  items={publicacionesTop}
                  loading={loadingTopPubs}
                  getKey={(publication : PublicationResponse) => `${publication.codePublication}-${publication.createdDate}`}
                  renderLoading={
                    <>
                      <SkeletonLine internal/>
                      <SkeletonLine internal/>
                      <SkeletonLine internal/>
                    </>
                  }
                  renderItem={(publication : PublicationResponse,i) => (
                    <TopPublicationCard
                      publication={publication}
                      onClickTitle={async () => { await onClickTitle(publication.codePublication); }}
                    />
                  )}
                  emptyMessage={<p>No hay preguntas destacadas todavía.</p>}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ModalComponent 
        closeIcon
        title='Crear Publicación'
        styles={{width: isMobile ? '100%' : '70%', marginTop: '100px'}} 
        open={showModalNewPub} 
        onClose={() => setShowModalNewPub(false)}
      >
        <CreatePublicationComponent onSubmit={handleOnCreatePublication} close={() => setShowModalNewPub(false) } loadingSubmit={loadingCreatePublication}/>
      </ModalComponent>
    </div>
  )
}
