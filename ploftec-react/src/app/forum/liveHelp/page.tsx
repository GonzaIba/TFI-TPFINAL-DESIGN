// src/app/Forum/Labels/page.tsx
'use client';

import styles from './page.module.css';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Grid, GridItem, Input, SideBarFilters, RequestHelpFeed, RequestHelpConfirmedFeed } from '@/components';
import { MyRequestHelpFeed } from '@/components/liveHelp/myRequestHelpFeed/myRequestHelpFeed';
import { UserFilterForumResponse } from '@/lib/types/forum';
import { filtrosService } from "@/lib/services/forum/filtrosService";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { X } from 'lucide-react';
import SearchIcon from '@mui/icons-material/Search';
import { GroupEnum } from '@/lib/types/enum';
import { Colors } from '@/theme/colors';
import useAuthStore from '@/store/slices/authStore/authStore';
import { useConfirmedHelpRequests } from '@/lib/query/hooks/forum/useRequestHelp';
import { SpotlightTour } from '@/components/onboarding/spotlight/spotlightTour';
import { onboardingService } from '@/lib/services/auth/onboardingService';
import { OnboardingUserEnum } from '@/lib/types/onboarding';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18 } }, // escalonado limpio
};

type LiveHelpIntroTarget = 'create' | 'others' | 'mine';

const LIVEHELP_INTRO_STEPS: Array<{
  target: LiveHelpIntroTarget;
  title: string;
  description: string;
  placement: 'left' | 'right' | 'top' | 'bottom';
  gap?: number;
}> = [
  {
    target: 'create',
    title: 'Creá tu solicitud',
    description: 'Desde aquí abrís el formulario para pedir ayuda en vivo. Contá tu problema y publicalo.',
    placement: 'right',
    gap: 28,
  },
  {
    target: 'others',
    title: 'Explorá solicitudes abiertas',
    description: 'En este feed ves las solicitudes de otras personas para ayudar o inspirarte.',
    placement: 'left',
    gap: 28,
  },
  {
    target: 'mine',
    title: 'Gestioná tus pedidos',
    description: 'Acá aparecen todas tus solicitudes publicadas para que sigas su estado y actualices datos.',
    placement: 'top',
    gap: 36,
  },
];

const LIVEHELP_CONFIRMED_STEP = {
  title: 'Sesiones confirmadas',
  description:
    'Cuando se acerque el horario te avisamos con una alerta. En el horario pactado este listado te permite entrar a la reunión.',
  placement: 'left' as const,
  gap: 28,
};

export default function LiveHelpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // filtros de usuario
  const [userFilters, setUserFilters] = useState<UserFilterForumResponse[]>([])
  const [shouldReloadUsers, setShouldReloadUsers] = useState(false)

  // input y búsqueda aplicada (lo que se envía al hook)
  const [queryInput, setQueryInput] = useState(searchParams.get('q') ?? '');
  const [appliedSearch, setAppliedSearch] = useState(searchParams.get('q') ?? '');

  // sidebar filtros
  const [showHelpFilters, setShowHelpFilters] = useState(false);

  // contador visible en el feed
  const [visibleCount, setVisibleCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [feedEnabled, setFeedEnabled] = useState(false);
  const isAuthLoaded = useAuthStore((state) => state.isAuthLoaded);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const createCardRef = useRef<HTMLDivElement | null>(null);
  const myRequestsRef = useRef<HTMLDivElement | null>(null);
  const requestFeedRef = useRef<HTMLDivElement | null>(null);
  const confirmedListRef = useRef<HTMLDivElement | null>(null);
  const [showLiveHelpIntro, setShowLiveHelpIntro] = useState(false);
  const [liveHelpIntroDismissed, setLiveHelpIntroDismissed] = useState(false);
  const [liveHelpIntroStepIndex, setLiveHelpIntroStepIndex] = useState(-1);
  const [liveHelpHighlightRect, setLiveHelpHighlightRect] = useState<DOMRect | null>(null);
  const [showConfirmedIntro, setShowConfirmedIntro] = useState(false);
  const [confirmedHighlightRect, setConfirmedHighlightRect] = useState<DOMRect | null>(null);
  const { data: confirmedRaw, isLoading: confirmedLoading } = useConfirmedHelpRequests(
    feedEnabled && isAuthLoaded && isAuthenticated,
    refreshCounter
  );
  const confirmedRequests = useMemo(() => {
    if (!confirmedRaw) return [];
    const clone = [...confirmedRaw];
    const safeTime = (value: string) => {
      const parsed = Date.parse(value);
      return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
    };
    return clone.sort((a, b) => safeTime(a.initAt) - safeTime(b.initAt));
  }, [confirmedRaw]);
  const showConfirmedSection = !confirmedLoading && confirmedRequests.length > 0;

  useEffect(() => {
    setLiveHelpIntroDismissed(false);
  }, [user?.email]);

  const getLiveHelpTargetElement = useCallback((target: LiveHelpIntroTarget) => {
    switch (target) {
      case 'create':
        return createCardRef.current;
      case 'others':
        return requestFeedRef.current;
      case 'mine':
        return myRequestsRef.current;
      default:
        return null;
    }
  }, []);

  const handleManageFilters = () => {
    setShowHelpFilters((p) => !p);
  };

  const applySearch = () => {
    const q = queryInput.trim();
    setAppliedSearch(q);
    const p = new URLSearchParams(searchParams.toString());
    q ? p.set('q', q) : p.delete('q');
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  const clearSearch = () => {
    setQueryInput('');
    setAppliedSearch('');
    const p = new URLSearchParams(searchParams.toString());
    p.delete('q');
    router.replace(`?${p.toString()}`, { scroll: false });
  };

  const computeLiveHelpHighlight = useCallback(() => {
    if (liveHelpIntroStepIndex < 0) return null;
    const step = LIVEHELP_INTRO_STEPS[liveHelpIntroStepIndex];
    if (!step) return null;
    const element = getLiveHelpTargetElement(step.target);
    return element ? element.getBoundingClientRect() : null;
  }, [liveHelpIntroStepIndex, getLiveHelpTargetElement]);

  useLayoutEffect(() => {
    if (!showLiveHelpIntro) return;
    setLiveHelpHighlightRect(computeLiveHelpHighlight());
  }, [showLiveHelpIntro, liveHelpIntroStepIndex, visibleCount, computeLiveHelpHighlight]);

  useEffect(() => {
    if (!showLiveHelpIntro) return;

    const update = () => setLiveHelpHighlightRect(computeLiveHelpHighlight());
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [showLiveHelpIntro, computeLiveHelpHighlight]);

  useEffect(() => {
    if (!user || user.hasSeenIntroLiveHelp || showLiveHelpIntro || liveHelpIntroDismissed) return;
    if (!createCardRef.current || !requestFeedRef.current || !myRequestsRef.current) return;

    setLiveHelpIntroStepIndex(0);
    setShowLiveHelpIntro(true);
  }, [user, showLiveHelpIntro, liveHelpIntroDismissed, visibleCount]);

  const finishLiveHelpIntro = useCallback(async () => {
    setShowLiveHelpIntro(false);
    setLiveHelpIntroDismissed(true);
    setLiveHelpIntroStepIndex(-1);
    setLiveHelpHighlightRect(null);

    if (!user || user.hasSeenIntroLiveHelp) return;

    try {
      await onboardingService.completeOnboarding(OnboardingUserEnum.HasSeenIntroLiveHelp);
      setUser({ ...user, hasSeenIntroLiveHelp: true });
    } catch (err) {
      console.error('No pude marcar la intro de live help', err);
    }
  }, [user, setUser]);

  const handleLiveHelpIntroNext = useCallback(() => {
    if (liveHelpIntroStepIndex + 1 >= LIVEHELP_INTRO_STEPS.length) {
      void finishLiveHelpIntro();
      return;
    }
    setLiveHelpIntroStepIndex((prev) => prev + 1);
  }, [finishLiveHelpIntro, liveHelpIntroStepIndex]);

  const handleLiveHelpIntroBack = useCallback(() => {
    setLiveHelpIntroStepIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleLiveHelpIntroSkip = useCallback(() => {
    void finishLiveHelpIntro();
  }, [finishLiveHelpIntro]);

  const liveHelpIntroStep =
    liveHelpIntroStepIndex >= 0 ? LIVEHELP_INTRO_STEPS[liveHelpIntroStepIndex] : null;

  useLayoutEffect(() => {
    if (!showConfirmedIntro) return;
    setConfirmedHighlightRect(confirmedListRef.current ? confirmedListRef.current.getBoundingClientRect() : null);
  }, [showConfirmedIntro, confirmedRequests]);

  useEffect(() => {
    if (!showConfirmedIntro) return;
    const update = () =>
      setConfirmedHighlightRect(confirmedListRef.current ? confirmedListRef.current.getBoundingClientRect() : null);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [showConfirmedIntro]);

  useEffect(() => {
    if (showLiveHelpIntro) return; // no overlap
    if (!user || user.hasSeenIntroLiveHelpConfirmed || showConfirmedIntro) return;
    if (!showConfirmedSection || !confirmedListRef.current) return;

    setShowConfirmedIntro(true);
  }, [user, showLiveHelpIntro, showConfirmedIntro, showConfirmedSection, confirmedRequests]);

  const finishConfirmedIntro = useCallback(async () => {
    setShowConfirmedIntro(false);
    setConfirmedHighlightRect(null);

    if (!user || user.hasSeenIntroLiveHelpConfirmed) return;

    try {
      await onboardingService.completeOnboarding(OnboardingUserEnum.HasSeenIntroLiveHelpConfirmed);
      setUser({ ...user, hasSeenIntroLiveHelpConfirmed: true });
    } catch (err) {
      console.error('No pude marcar la intro de confirmados', err);
    }
  }, [user, setUser]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') applySearch();
  };

  const steps = useMemo(() => [
    { number: 1, title: 'Inicia sesión',  description: 'Para solicitar una ayuda debes iniciar sesión, puedes hacerlo desde el menú de navegación.' },
    { number: 2, title: 'Publica tu ayuda', description: 'Describe tu problema, añade etiquetas y brinda detalles técnicos para que un profesional lo entienda rápido.' },
    { number: 3, title: 'Espera contacto', description: 'Un profesional disponible revisará tu publicación y te contactará en una sala de ayuda en vivo.' },
  ], []);

  const handleSaveUserFilters = async (valuePairs: Record<number, string>) => {
    if (!isAuthenticated) return;
    const filtered = Object.fromEntries(
      Object.entries(valuePairs).filter(([_, v]) => v.trim() !== '')
    )
    await filtrosService.addFilterUser({ filters_CodeValue: filtered })
    const nuevosFiltros = (await filtrosService.getFilterUser(GroupEnum.ForumRequestHelp)).data
    setUserFilters(nuevosFiltros ?? [])
    setShouldReloadUsers(true)
    setRefreshCounter((c) => c + 1)
    setShowHelpFilters(false)
  }

  const handleResetearFiltros = async () => {
    if (!isAuthenticated) return;
    if (userFilters.length > 0) {
      await filtrosService.deleteAllFiltersUser(`${GroupEnum.ForumRequestHelp}`)
      const filtrosActualizados = (await filtrosService.getFilterUser(GroupEnum.ForumRequestHelp)).data
      setUserFilters(filtrosActualizados ?? [])
      setShouldReloadUsers(true)
      setRefreshCounter((c) => c + 1)
      setShowHelpFilters(false)
    }
  }

  const handleEliminarFiltro = async (codigoFiltro: number) => {
    if (!isAuthenticated) return;
    await filtrosService.deleteFilterUser(codigoFiltro)
    const filtrosActualizados = (await filtrosService.getFilterUser(GroupEnum.ForumRequestHelp)).data
    setUserFilters(filtrosActualizados ?? [])
    setShouldReloadUsers(true)
    setRefreshCounter((c) => c + 1)
  }

  useEffect(() => {
    if (!feedEnabled || !isAuthLoaded) return;

    if (!isAuthenticated) {
      setUserFilters([]);
      return;
    }

    const loadFilters = async () => {
      const filtros = (await filtrosService.getFilterUser(GroupEnum.ForumRequestHelp)).data;
      setUserFilters(filtros ?? []);
    };
    loadFilters();
  }, [feedEnabled, isAuthLoaded, isAuthenticated])

  const handleCountChange = useCallback((visible: number, more: boolean) => {
    setVisibleCount(visible);
    setHasMore(more);
  }, []);

  return (
    <div className={styles.liveHelpContainer}>
      <motion.section
        className={styles.headerWrapper}
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          Ayuda en vivo
        </motion.h1>

        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Publica tu duda o problema para que te contacte un profesional! <br />
          Recuerda brindar información precisa y no compartir datos sensibles.
        </motion.p>

        {/* Pasos */}
        <Grid colsXs={12}>
          {steps.map((step, i) => (
            <GridItem key={'grid-' + step.number} colSpanXl={4} colSpanMd={6} colSpanXs={12}>
              <motion.div                 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.2, duration: 0.6, ease: 'easeOut', }}
                onAnimationComplete={() => { if (i === steps.length - 1) setFeedEnabled(true) }}
              >
                <motion.div 
                  className={styles.stepCard} 
                  transition={{ delay: 0.1, duration: 0.2, ease: 'easeOut', }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className={styles.stepHeader}>
                    <div className={styles.stepNumber}>{step.number}</div>
                    <h3>{step.title}</h3>
                  </div>
                  <p>{step.description}</p>
                </motion.div>
              </motion.div>
            </GridItem>
          ))}
        </Grid>

        <AnimatePresence>
          {showConfirmedSection && (
            <motion.div
              key="confirmed-section"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <h2 className={styles.sectionTitle}>Confirmadas</h2>
              <div className={styles.mySectionContainer} ref={confirmedListRef}>
                <RequestHelpConfirmedFeed items={confirmedRequests} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mis solicitudes de ayuda */}
        <h2 className={styles.sectionTitle}>Mis solicitudes de ayuda</h2>
        <div className={styles.mySectionContainer} ref={myRequestsRef}>
          <MyRequestHelpFeed
            enabled={feedEnabled && isAuthLoaded && isAuthenticated}
            isAuthenticated={isAuthenticated}
            isAuthLoaded={isAuthLoaded}
            createCardRef={createCardRef}
          />
        </div>

        <div className={styles.filterContainer} style={{ paddingBottom: userFilters.length > 0 ? 0 : 24 }}>
          <div className={styles.totalBox}>
            <h2 className={`${styles.sectionTitle} ${styles.sectionTitleCompact}`}>
              Solicitudes: {visibleCount}
              {hasMore ? '+' : ''}
            </h2>
          </div>

          <div className={styles.searchRow}>
            <div className={styles.searchRowInner}>
              <Input
                placeHolder="Buscar por texto en la descripción (ej: EF Core, XSS, Docker)"
                onInput={(e) => setQueryInput(e.target.value)}
                value={queryInput}
                customStyle={{ height: '46px', fontSize: '15px', backgroundColor: '#121212', minWidth: 420 }}
                useSearch={false}
                showIcon={false}
                useClear={false}
                //onKeyDown={onKeyDown}
              />

              <div className={styles.buttonGroup}>
                <Button
                  onClick={applySearch}
                  width="120px"
                  icon={<SearchIcon sx={{ color: Colors.black }} fontSize="medium" />}
                  text="Buscar"
                />

                {appliedSearch && (
                  <Button
                    onClick={clearSearch}
                    icon={<RestartAltIcon sx={{ color: Colors.primary }} fontSize="medium" />}
                    text="Limpiar"
                    width="80px"
                    transparent
                  />
                )}

                <Button
                  onClick={handleManageFilters}
                  icon={<FilterAltIcon sx={{ color: Colors.primary }} fontSize="medium" />}
                  text="Filtros"
                  width="120px"
                  transparent
                />
              </div>
            </div>
          </div>

          {/* Espaciador derecho para mantener el centro perfecto */}
          <div className={styles.spacer} />
        </div>


        {/* Sidebar de filtros (sin cambios) */}
        <SideBarFilters
          show={showHelpFilters}
          closeFunction={handleManageFilters}
          saveFunction={handleSaveUserFilters}
          resetFunction={handleResetearFiltros}
          onCompleted={handleManageFilters}
          grupo={GroupEnum.ForumRequestHelp}
        />

        {/* Chips de filtros aplicados */}
        {(userFilters.length > 0 || appliedSearch) && (
          <div className={styles.appliedRow}>
            {appliedSearch && (
              <span className={`${styles.chip} ${styles.chipApplied}`}>
                {`Buscar: ${appliedSearch.length > 80 ? appliedSearch.slice(0,80) + '…' : appliedSearch}`}
                <Button
                  onClick={clearSearch}
                  width="18px"
                  height="18px"
                  borderRadius="50%"
                  backgroundColor="#1a1a1a"
                  icon={<X size={12} color="#cfcfcf" />}
                />
              </span>
            )}
            {userFilters.map((f) => (
              <span key={f.codeFilter} className={`${styles.chip} ${styles.chipApplied}`}>
                {f.description}: {f.value}
                <Button
                  onClick={() => handleEliminarFiltro(f.codeFilter)}
                  width="18px"
                  height="18px"
                  borderRadius="50%"
                  backgroundColor="#1a1a1a"
                  icon={<X size={12} color="#cfcfcf" />}
                />
              </span>
            ))}
          </div>
        )}

        {/* Feed */}
        <div className={styles.feedContainer} ref={requestFeedRef}>
          <RequestHelpFeed
            pageSize={9}
            search={appliedSearch}
            refresh={refreshCounter}
            enabled={feedEnabled}
            onCountChange={handleCountChange}
          />
        </div>
      </motion.section>
      {liveHelpIntroStep && (
        <SpotlightTour
          isVisible={showLiveHelpIntro}
          stepIndex={liveHelpIntroStepIndex}
          totalSteps={LIVEHELP_INTRO_STEPS.length}
          title={liveHelpIntroStep.title}
          description={liveHelpIntroStep.description}
          highlightRect={liveHelpHighlightRect}
          panelPlacement={liveHelpIntroStep.placement}
          panelGap={liveHelpIntroStep.gap}
          canGoBack={liveHelpIntroStepIndex > 0}
          onPrev={handleLiveHelpIntroBack}
          onNext={handleLiveHelpIntroNext}
          onSkip={handleLiveHelpIntroSkip}
        />
      )}

      {showConfirmedIntro && confirmedHighlightRect && (
        <SpotlightTour
          isVisible={showConfirmedIntro}
          stepIndex={0}
          totalSteps={1}
          title={LIVEHELP_CONFIRMED_STEP.title}
          description={LIVEHELP_CONFIRMED_STEP.description}
          highlightRect={confirmedHighlightRect}
          panelPlacement={LIVEHELP_CONFIRMED_STEP.placement}
          panelGap={LIVEHELP_CONFIRMED_STEP.gap}
          canGoBack={false}
          onPrev={undefined}
          onNext={() => void finishConfirmedIntro()}
          onSkip={() => void finishConfirmedIntro()}
        />
      )}
    </div>
  );
}
