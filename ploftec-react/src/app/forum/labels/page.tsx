// src/app/Forum/Labels/page.tsx
'use client';

import styles from './page.module.css';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { LabelCard, SkeletonLabelCard, Paginator, ErrorMiniCard } from '@/components';
import AnimatedSelect, { UiOption } from '@/components/selectComponent/selectComponent';
import { useLabels } from '@/lib/query/hooks';
import { LabelFiltersEnum } from '@/lib/types/enum';
import useAuthStore from '@/store/slices/authStore/authStore';
import { SpotlightTour } from '@/components/onboarding/spotlight/spotlightTour';
import { onboardingService } from '@/lib/services/auth/onboardingService';
import { OnboardingUserEnum } from '@/lib/types/onboarding';

type UiFilterOption = {
  text: string;
  value: LabelFiltersEnum;
};

const FILTER_OPTIONS: UiOption<LabelFiltersEnum>[] = [
  { text: 'Alfabético A-Z', value: LabelFiltersEnum.Alphabetical_AZ },
  { text: 'Alfabético Z-A', value: LabelFiltersEnum.Alphabetical_ZA },
  { text: 'Más populares', value: LabelFiltersEnum.MostPopular },
  { text: 'Más recientes', value: LabelFiltersEnum.Latest },
];

type IntroTarget = 'filter' | 'grid' | 'card';

type LabelsIntroStep = {
  target: IntroTarget;
  title: string;
  description: string;
  placement: 'left' | 'right' | 'top' | 'bottom';
  gap?: number;
};

const LABELS_INTRO_STEPS: LabelsIntroStep[] = [
  {
    target: 'filter',
    title: 'Filtrá etiquetas al toque',
    description:
      'Este selector mágico organiza las etiquetas por popularidad, fecha o alfabéticamente. Elegí el filtro que mejor se adapte a tu búsqueda.',
    placement: 'right',
    gap: 32,
  },
  {
    target: 'grid',
    title: 'Mirá cómo reacciona la grilla',
    description:
      'Cada vez que cambiás el filtro, esta cuadrícula se anima y te muestra el contenido actualizado en tiempo real.',
    placement: 'bottom',
    gap: 56,
  },
  {
    target: 'card',
    title: 'Un clic te lleva a publicaciones',
    description:
      'Seleccioná cualquiera de estas tarjetas y abrimos Publicaciones ya filtrado por esa etiqueta. Así vas directo al tema que te interesa.',
    placement: 'right',
    gap: 32,
  },
];

export default function LabelsPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const filterWrapperRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const firstLabelRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const search = searchParams.get('search') ?? '';
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [showLabelsIntro, setShowLabelsIntro] = useState(false);
  const [labelsIntroDismissed, setLabelsIntroDismissed] = useState(false);
  const [introStepIndex, setIntroStepIndex] = useState(-1);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);

  // Filtro seleccionado (default: Más populares)
  const [filter, setFilter] = useState<LabelFiltersEnum>(LabelFiltersEnum.Alphabetical_AZ);

  // Paginación
  const [page, setPage] = useState(1);
  const postsPerPage = 16;

  // Data
  const {
    data: labels,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useLabels(page, postsPerPage, search, filter);
  const labelsData = labels?.list ?? [];
  const totalPages = labels?.totalPages ?? 1;

  const hasError = isError;
  const retryLabels = useCallback(() => {
    void refetch();
  }, [refetch]);
  const labelsErrorDescription = useMemo(
    () => 'No pudimos cargar las etiquetas. Intenta nuevamente más tarde.',
    [error],
  );

  const onPageChange = (newPage: number) => setPage(newPage);

  const handleOnFilterSelect = (selected: UiFilterOption) => {
    setFilter(selected.value);
    setPage(1);                 // reset paginación al cambiar filtro
    setFilterOpen(false);
  };

  const handleOnLabelClick = (labelName: string) => {
    const params = new URLSearchParams();
    const pathname = '/forum/publications';
    params.set("search", encodeURIComponent(`[${labelName}]`));
    router.push(`${pathname}?${params.toString()}`);
    //router.push(`/forum/publications?search=${encodeURIComponent(`[${labelName}]`)}`);
  }

  // Cerrar dropdown al click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterWrapperRef.current && !filterWrapperRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    };
    if (filterOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen]);

  const loading = !hasError && (isLoading || isFetching);
  const isEmpty = !loading && !hasError && labelsData.length === 0;
  const introStep = introStepIndex >= 0 ? LABELS_INTRO_STEPS[introStepIndex] : null;
  const canGoBack = introStepIndex > 0;

  useEffect(() => {
    setLabelsIntroDismissed(false);
  }, [user?.email]);

  useEffect(() => {
    if (!user || user.hasSeenIntroLabels || showLabelsIntro || labelsIntroDismissed) return;
    if (loading || hasError || labelsData.length === 0) return;

    setIntroStepIndex(0);
    setShowLabelsIntro(true);
  }, [user, showLabelsIntro, labelsIntroDismissed, loading, hasError, labelsData.length]);

  useEffect(() => {
    if (!labelsData.length) {
      firstLabelRef.current = null;
    }
  }, [labelsData.length]);

  const computeTargetRect = useCallback(() => {
    if (introStepIndex < 0) return null;
    const step = LABELS_INTRO_STEPS[introStepIndex];
    if (!step) return null;

    let element: HTMLElement | null = null;
    switch (step.target) {
      case 'filter':
        element = filterWrapperRef.current;
        break;
      case 'grid':
        element = gridRef.current;
        break;
      case 'card':
        element = firstLabelRef.current;
        break;
      default:
        element = null;
        break;
    }

    return element ? element.getBoundingClientRect() : null;
  }, [filterWrapperRef, gridRef, firstLabelRef, introStepIndex]);

  useLayoutEffect(() => {
    if (!showLabelsIntro) return;
    setHighlightRect(computeTargetRect());
  }, [showLabelsIntro, introStepIndex, labelsData, computeTargetRect]);

  useEffect(() => {
    if (!showLabelsIntro) return;

    const handleUpdate = () => {
      setHighlightRect(computeTargetRect());
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);
    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
    };
  }, [showLabelsIntro, computeTargetRect]);

  const finishLabelsIntro = useCallback(async () => {
    setShowLabelsIntro(false);
    setLabelsIntroDismissed(true);
    setIntroStepIndex(-1);
    setHighlightRect(null);

    if (!user || user.hasSeenIntroLabels) return;

    try {
      await onboardingService.completeOnboarding(OnboardingUserEnum.HasSeenIntroLabels);
      setUser({ ...user, hasSeenIntroLabels: true });
    } catch (err) {
      console.error('No pude marcar la intro de etiquetas', err);
    }
  }, [user, setUser]);

  const handleIntroNext = useCallback(() => {
    if (introStepIndex + 1 >= LABELS_INTRO_STEPS.length) {
      void finishLabelsIntro();
      return;
    }

    setIntroStepIndex((prev) => prev + 1);
  }, [finishLabelsIntro, introStepIndex]);

  const handleIntroSkip = useCallback(() => {
    void finishLabelsIntro();
  }, [finishLabelsIntro]);

  const handleIntroBack = useCallback(() => {
    setIntroStepIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  return (
    <section className={styles.labelsPage}>
      <header className={styles.header}>
        <div className={styles.description}>
          <h1>Explorá etiquetas</h1>
          <p>
            Las etiquetas te ayudan a encontrar publicaciones relacionadas con temas específicos.
            Explorá por categorías y descubrí contenido que te interese.
          </p>

          <div className={styles.filterWrapper} ref={filterWrapperRef}>
            <AnimatedSelect<LabelFiltersEnum>
              options={FILTER_OPTIONS}
              value={filter}
              onChange={handleOnFilterSelect}
              placeholder="Filtrar por:"
              width={220}
              icon={<FilterAltIcon />}
              align="left"
              springy
            />
          </div>
        </div>
      </header>

      <main className={styles.grid} ref={gridRef}>
        {hasError ? (
          <div className={styles.errorState}>
            <ErrorMiniCard
              title="No pudimos cargar las etiquetas"
              description={labelsErrorDescription}
              onRetry={retryLabels}
            />
          </div>
        ) : loading ? (
          Array.from({ length: postsPerPage }).map((_, i) => (
            <div key={i} className={styles.containerLabel}>
              <SkeletonLabelCard />
            </div>
          ))
        ) : isEmpty ? (
          <div className={styles.emptyState}>
            <p>No encontramos etiquetas para mostrar.</p>
          </div>
        ) : (
          labelsData.map((label, i) => (
            <motion.div
              key={label.codeLabel}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.98 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={{ duration: 0.4, ease: 'easeOut', delay: i * 0.05 }}
              className={styles.containerLabel}
              ref={i === 0 ? firstLabelRef : undefined}
            >
              <LabelCard
                label={label}
                onClick={() => handleOnLabelClick(label.name)}
              />
            </motion.div>
          ))
        )}
      </main>

      {!hasError && (
        <div className={styles.containerPaginator}>
          <Paginator
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            isComponentLoading={loading}
          />
        </div>
      )}

      {introStep && (
        <SpotlightTour
          isVisible={showLabelsIntro}
          stepIndex={introStepIndex}
          totalSteps={LABELS_INTRO_STEPS.length}
          title={introStep.title}
          description={introStep.description}
          highlightRect={highlightRect}
          panelPlacement={introStep.placement}
          panelGap={introStep.gap}
          canGoBack={canGoBack}
          onPrev={handleIntroBack}
          onNext={handleIntroNext}
          onSkip={handleIntroSkip}
        />
      )}
    </section>
  );
}
