// src/app/Forum/Publications/page.tsx
'use client'

import { useState, useRef, useEffect, useMemo, useCallback, useLayoutEffect } from 'react'
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation'
import { 
  SkeletonPublication, 
  SkeletonAvatarAndName, 
  PanelSection, 
  ErrorMiniCard,
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
import { PublicationResponse, PublicationDetailResponse, CreatePublicationRequest, SuccessfulResponse } from '@/lib/types/forum'
import { PaginatedList, GenericApiResponse } from '@/lib/types/apiResponse'
import { AvatarCrownEnum } from '@/lib/types/enum'
import { Add, Bookmark, BookmarkBorder, BorderColor, BorderColorOutlined, Close } from '@mui/icons-material';
import { Colors } from '@/theme/colors'
import { motion, AnimatePresence } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { publicationsKeys } from '@/lib/query/keys';
import { useWindowWidth } from '@/hooks';
import useAuthStore from '@/store/slices/authStore/authStore';
import { SpotlightTour } from '@/components/onboarding/spotlight/spotlightTour';
import { onboardingService } from '@/lib/services/auth/onboardingService';
import { OnboardingUserEnum } from '@/lib/types/onboarding';
import {
  usePublications,
  useTopPublications,
  useTopUsers,
  useSavedPublications,
  useCreatedPublications,
} from '@/lib/query/hooks';

type Filter = 'all' | 'saved' | 'created';

type PublicationsIntroTarget = 'paginator' | 'create' | 'saved' | 'created' | 'insights';

type PublicationsIntroStep = {
  target: PublicationsIntroTarget;
  title: string;
  description: string;
  placement: 'left' | 'right' | 'top' | 'bottom';
  gap?: number;
};

const PUBLICATIONS_INTRO_STEPS: PublicationsIntroStep[] = [
  {
    target: 'paginator',
    title: 'Recorré todas las publicaciones',
    description: 'Usá el paginador para avanzar o retroceder entre páginas sin perderte ninguna pregunta.',
    placement: 'top',
    gap: 36,
  },
  {
    target: 'create',
    title: 'Creá tu propia consulta',
    description: 'Con este botón abrís el modal para redactar una nueva publicación y obtener ayuda de la comunidad.',
    placement: 'right',
    gap: 28,
  },
  {
    target: 'saved',
    title: 'Tus publicaciones guardadas',
    description: 'Accedé rápidamente a las publicaciones que marcaste para retomarlas más tarde.',
    placement: 'right',
    gap: 24,
  },
  {
    target: 'created',
    title: 'Tus aportes',
    description: 'Filtrá por las publicaciones que vos mismo creaste para seguir sus respuestas y actividad.',
    placement: 'right',
    gap: 24,
  },
  {
    target: 'insights',
    title: 'Inspirate con lo mejor de la semana',
    description: 'Explorá los top usuarios y preguntas destacadas para descubrir contenido relevante.',
    placement: 'left',
    gap: 32,
  },
];

export default function PublicationsPage() {
  const router = useRouter()
  const searchParams = useSearchParams();
  const search = searchParams.get('search') ?? '';
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
  const isTinyPhone = width <= 320
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const paginatorRef = useRef<HTMLDivElement | null>(null);
  const createButtonRef = useRef<HTMLDivElement | null>(null);
  const savedButtonRef = useRef<HTMLDivElement | null>(null);
  const createdButtonRef = useRef<HTMLDivElement | null>(null);
  const insightsPanelRef = useRef<HTMLDivElement | null>(null);

  const [showPublicationsIntro, setShowPublicationsIntro] = useState(false);
  const [publicationsIntroDismissed, setPublicationsIntroDismissed] = useState(false);
  const [publicationsIntroStepIndex, setPublicationsIntroStepIndex] = useState(-1);
  const [publicationsHighlightRect, setPublicationsHighlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    setIsMobile(width < 768)
  }, [width])

  useEffect(() => {
    setPublicationsIntroDismissed(false);
  }, [user?.email]);

  // Extract label filter from `search` if it comes as [label]
  const [labelFilter, setLabelFilter] = useState<string | null>(null)
  useEffect(() => {
    const decodeSafely = (val: string) => {
      try { return decodeURIComponent(val) } catch { return val }
    }
    // handle potential double-encoding from source navigation
    let decoded = decodeSafely(search)
    const maybeStillEncoded = /%[0-9A-Fa-f]{2}/.test(decoded)
    if (maybeStillEncoded) decoded = decodeSafely(decoded)
    const match = decoded.match(/^\[(.+)\]$/)
    setLabelFilter(match ? match[1] : null)
  }, [search])

  /* ---------- Queries ---------- */
  const {
    data: paginatedPubs,
    isLoading: loadingAll,
    isFetching: fetchingAll,
    isError: isErrorAll,
    error: errorAll,
    refetch: refetchAll,
  } = usePublications(currentPage, postsPerPage, search)

  const {
    data: paginatedSaved,
    isLoading: loadingSaved,
    isFetching: fetchingSaved,
    isError: isErrorSaved,
    error: errorSaved,
    refetch: refetchSaved,
  } = useSavedPublications(filter === 'saved', currentPage, postsPerPage)

  const {
    data: paginatedCreated,
    isLoading: loadingCreated,
    isError: isErrorCreated,
    error: errorCreated,
    refetch: refetchCreated,
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
    isError: isErrorTopPubs,
    error: errorTopPubs,
    refetch: refetchTopPubs,
  } = useTopPublications();

  const {
    data: usuariosTop = [],
    isLoading: loadingTopUsers,
    isError: isErrorTopUsers,
    error: errorTopUsers,
    refetch: refetchTopUsers,
  } = useTopUsers();

  const isPaginatorLoading = loadingPubs

  const handleError = useErrorHandler();
  const queryClient = useQueryClient();

  const retryAllPublications = useCallback(() => {
    void refetchAll();
  }, [refetchAll]);

  const retrySavedPublications = useCallback(() => {
    void refetchSaved();
  }, [refetchSaved]);

  const retryCreatedPublications = useCallback(() => {
    void refetchCreated();
  }, [refetchCreated]);

  const retryTopUsers = useCallback(() => {
    void refetchTopUsers();
  }, [refetchTopUsers]);

  const retryTopPublications = useCallback(() => {
    void refetchTopPubs();
  }, [refetchTopPubs]);

  const showCreatePublicationError = useCallback(() => {
    handleError([
      {
        nameError: 'CreatePublicationError',
        message: 'Ocurrió un error al crear la publicación.',
      } as any,
    ]);
  }, [handleError]);

  const publicationsError = useMemo(() => {
    if (filter === 'all' && isErrorAll) {
      return {
        title: 'No pudimos cargar las publicaciones',
        description: 'Reintenta en unos segundos para ver las publicaciones mas recientes.',
        onRetry: retryAllPublications,
      };
    }
    if (filter === 'saved' && isErrorSaved) {
      return {
        title: 'No pudimos cargar tus publicaciones guardadas',
        description: 'Actualiza la pagina o proba nuevamente en unos instantes.',
        onRetry: retrySavedPublications,
      };
    }
    if (filter === 'created' && isErrorCreated) {
      return {
        title: 'No pudimos cargar tus publicaciones creadas',
        description: 'Proba recargar o intenta nuevamente la consulta.',
        onRetry: retryCreatedPublications,
      };
    }
    return null;
  }, [
    filter,
    isErrorAll,
    errorAll,
    retryAllPublications,
    isErrorSaved,
    errorSaved,
    retrySavedPublications,
    isErrorCreated,
    errorCreated,
    retryCreatedPublications,
  ]);

  const topUsersEmptyState = useMemo(() => {
    if (isErrorTopUsers) {
      return (
        <ErrorMiniCard
          title="No pudimos cargar el top de usuarios"
          description="Se produjo un error. Intentalo nuevamente mas tarde."
          onRetry={retryTopUsers}
        />
      );
    }
    return (
      <p>
        Aun no hay usuarios con puntos esta semana.
        <br />
        Se el primero!
      </p>
    );
  }, [isErrorTopUsers, errorTopUsers, retryTopUsers]);

  const topQuestionsEmptyState = useMemo(() => {
    if (isErrorTopPubs) {
      return (
        <ErrorMiniCard
          title="No pudimos cargar el top de preguntas"
          description="Se produjo un error. Intentalo nuevamente mas tarde."
          onRetry={retryTopPublications}
        />
      );
    }
    return <p>No hay preguntas destacadas todavia.</p>;
  }, [isErrorTopPubs, errorTopPubs, retryTopPublications]);

  const toggleFilter = (f: Filter) => {
    setFilter(prev => (prev === f ? 'all' : f));   // si vuelven a pulsar, vuelve a 'all'
  };

  const onPageChange = (newPage: number) => {
    setPages(prev => ({ ...prev, [filter]: newPage }))
  }

  const { mutate: toggleSave } = useMutation<
    GenericApiResponse<SuccessfulResponse>,
    Error,
    { codePub: number; isSaved: boolean; page: number; pageSize: number; filter: Filter }
  >({
    mutationFn: ({ codePub, isSaved }) =>
      isSaved
        ? publicationsService.deleteSavedPublication(codePub)
        : publicationsService.savePublication(codePub),

    onError: err => handleError([{ message: err.message } as any]),

    onSuccess: (_resp, { codePub, isSaved, page, pageSize, filter: currFilter }) => {
      // parchar “all”
      queryClient.setQueryData<PaginatedList<PublicationResponse>>(
        publicationsKeys.list(page, pageSize),
        prev => {
          if (!prev) return prev
          return {
            ...prev,
            list: prev.list.map(pub =>
              pub.codePublication === codePub
                ? { ...pub, isSaved: !isSaved }
                : pub
            )
          }
        }
      )

      // si estoy en “saved”, además lo saco de ahí
      if (currFilter === 'saved') {
        queryClient.setQueryData<PaginatedList<PublicationResponse>>(
          publicationsKeys.saved(page, pageSize),
          prev => {
            if (!prev) return prev
            const newTotal = prev.totalCount - 1
            return {
              ...prev,
              list: prev.list.filter(pub => pub.codePublication !== codePub),
              totalCount: newTotal,
              totalPages: Math.max(1, Math.ceil(newTotal / pageSize)),
            }
          }
        )
      }
      else {
        queryClient.invalidateQueries({ queryKey : publicationsKeys.saved(page, pageSize)});
      }
    }
  })

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
    setLoadingCreatePublication(true);
    try {
      const response = await publicationsService.createPublication(data);
      if (response.errors?.errorsList?.length) {
        handleError(response.errors.errorsList);
        showCreatePublicationError();
        return;
      }

      setShowModalNewPub(false);
    } catch(error) {
      console.error(error);
      showCreatePublicationError();
    } finally {
      setLoadingCreatePublication(false);
    }
  }

  const onClicRelatedPub = async (codigo: number) => {
    setCurrentPublication(undefined)
    setRelatedPublications(undefined)
    await fetchPublicationDetail(codigo)
  }

  const clearLabelFilter = () => {
    router.push('/forum/publications')
  }
  
  const getElementForTarget = useCallback((target: PublicationsIntroTarget) => {
    switch (target) {
      case 'paginator':
        return paginatorRef.current;
      case 'create':
        return createButtonRef.current;
      case 'saved':
        return savedButtonRef.current;
      case 'created':
        return createdButtonRef.current;
      case 'insights':
        return insightsPanelRef.current;
      default:
        return null;
    }
  }, []);

  const computePublicationsHighlight = useCallback(() => {
    if (publicationsIntroStepIndex < 0) return null;
    const step = PUBLICATIONS_INTRO_STEPS[publicationsIntroStepIndex];
    if (!step) return null;
    const element = getElementForTarget(step.target);
    return element ? element.getBoundingClientRect() : null;
  }, [publicationsIntroStepIndex, getElementForTarget]);

  useLayoutEffect(() => {
    if (!showPublicationsIntro) return;
    setPublicationsHighlightRect(computePublicationsHighlight());
  }, [showPublicationsIntro, publicationsIntroStepIndex, publicacionesData, computePublicationsHighlight]);

  useEffect(() => {
    if (!showPublicationsIntro) return;

    const handleUpdate = () => {
      setPublicationsHighlightRect(computePublicationsHighlight());
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);
    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [showPublicationsIntro, computePublicationsHighlight]);

  useEffect(() => {
    if (!user || user.hasSeenIntroPublications || showPublicationsIntro || publicationsIntroDismissed) return;
    if (loadingPubs || loadingSaved || loadingCreated) return;
    if (!publicacionesData?.length) return;
    const firstElement = getElementForTarget(PUBLICATIONS_INTRO_STEPS[0].target);
    if (!firstElement) return;

    setPublicationsIntroStepIndex(0);
    setShowPublicationsIntro(true);
  }, [
    user,
    showPublicationsIntro,
    publicationsIntroDismissed,
    loadingPubs,
    loadingSaved,
    loadingCreated,
    publicacionesData,
    getElementForTarget,
  ]);

  const finishPublicationsIntro = useCallback(async () => {
    setShowPublicationsIntro(false);
    setPublicationsIntroDismissed(true);
    setPublicationsIntroStepIndex(-1);
    setPublicationsHighlightRect(null);

    if (!user || user.hasSeenIntroPublications) return;

    try {
      await onboardingService.completeOnboarding(OnboardingUserEnum.HasSeenIntroPublications);
      setUser({ ...user, hasSeenIntroPublications: true });
    } catch (err) {
      console.error('No pude marcar la intro de publicaciones', err);
    }
  }, [user, setUser]);

  const handleIntroNext = useCallback(() => {
    if (publicationsIntroStepIndex + 1 >= PUBLICATIONS_INTRO_STEPS.length) {
      void finishPublicationsIntro();
      return;
    }

    setPublicationsIntroStepIndex((prev) => prev + 1);
  }, [finishPublicationsIntro, publicationsIntroStepIndex]);

  const handleIntroBack = useCallback(() => {
    setPublicationsIntroStepIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleIntroSkip = useCallback(() => {
    void finishPublicationsIntro();
  }, [finishPublicationsIntro]);

  const publicationsIntroStep =
    publicationsIntroStepIndex >= 0 ? PUBLICATIONS_INTRO_STEPS[publicationsIntroStepIndex] : null;
  const canGoBack = publicationsIntroStepIndex > 0;
  
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
                  <div ref={createButtonRef} style={{ display: 'flex' }}>
                    <Button
                      text={isTinyPhone ? '' : 'Crear Publicación'}
                      onClick={onNewPublication}
                      icon={<Add fontSize="medium" />}
                      circular={isTinyPhone}
                      width={isTinyPhone ? '45px' : '200px'}
                    />
                  </div>

                  {/* Guardadas */}
                  <div ref={savedButtonRef} style={{ display: 'flex' }}>
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
                  </div>

                  {/* Creadas */}
                  <div ref={createdButtonRef} style={{ display: 'flex' }}>
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

                  {labelFilter && (
                    <div className="active-filter-chip" title="Filtrando por etiqueta">
                      <span className="chip-label">Etiqueta: {labelFilter}</span>
                      <button className="chip-close" onClick={clearLabelFilter} aria-label="Quitar filtro de etiqueta">
                        <Close fontSize="small" />
                      </button>
                    </div>
                  )}
                </div>

                {/* ––– LISTA PUBLICACIONES ––– */}
                {publicationsError ? (
                  <ErrorMiniCard
                    title={publicationsError.title}
                    description={publicationsError.description}
                    onRetry={publicationsError.onRetry}
                  />
                ) : loadingPubs ? (
                  <>
                    <SkeletonPublication />
                    <SkeletonPublication />
                    <SkeletonPublication />
                    <SkeletonPublication />
                  </>
                ) : publicacionesData?.length ? (
                  <>
                    {publicacionesData?.map((pub, i) => (
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
                          onToggleSave={async () =>
                            toggleSave({
                              codePub: pub.codePublication,
                              isSaved: pub.isSaved,
                              page: currentPage,
                              pageSize: postsPerPage,
                              filter,             // tu estado actual de filtro
                            })
                          }
                        />
                      </motion.div>
                    ))}
                  
                    <div ref={paginatorRef}>
                      <Paginator
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                        isComponentLoading={isPaginatorLoading}
                      />
                    </div>
                  </>
                ) : filter === 'created' ? (
                  <p>Aún no tenés publicaciones creadas…</p>
                ) : (
                  <p>Aún no hay publicaciones cargadas…</p>
                )}
              </div>

              {/* —————— Lado derecho (top-users y top-questions) —————— */}
              <div className="forum-right" ref={insightsPanelRef}>
                
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
                  emptyMessage={topUsersEmptyState}

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
                  emptyMessage={topQuestionsEmptyState}

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

      {publicationsIntroStep && (
        <SpotlightTour
          isVisible={showPublicationsIntro}
          stepIndex={publicationsIntroStepIndex}
          totalSteps={PUBLICATIONS_INTRO_STEPS.length}
          title={publicationsIntroStep.title}
          description={publicationsIntroStep.description}
          highlightRect={publicationsHighlightRect}
          panelPlacement={publicationsIntroStep.placement}
          panelGap={publicationsIntroStep.gap}
          canGoBack={canGoBack}
          onPrev={handleIntroBack}
          onNext={handleIntroNext}
          onSkip={handleIntroSkip}
        />
      )}
    </div>
  )
}
