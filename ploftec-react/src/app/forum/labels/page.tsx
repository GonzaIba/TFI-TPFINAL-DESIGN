// src/app/Forum/Labels/page.tsx
'use client';

import styles from './page.module.css';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { LabelCard, SkeletonLabelCard, Paginator, ErrorMiniCard } from '@/components';
import AnimatedSelect, { UiOption } from '@/components/selectComponent/selectComponent';
import { useLabels } from '@/lib/query/hooks';
import { LabelFiltersEnum } from '@/lib/types/enum';

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

export default function LabelsPage() {
  const [filterOpen, setFilterOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const search = searchParams.get('search') ?? '';

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
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    };
    if (filterOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen]);

  const loading = !hasError && (isLoading || isFetching);
  const isEmpty = !loading && !hasError && labelsData.length === 0;

  return (
    <section className={styles.labelsPage}>
      <header className={styles.header}>
        <div className={styles.description}>
          <h1>Explorá etiquetas</h1>
          <p>
            Las etiquetas te ayudan a encontrar publicaciones relacionadas con temas específicos.
            Explorá por categorías y descubrí contenido que te interese.
          </p>

          <div className={styles.filterWrapper} ref={dropdownRef}>
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

      <main className={styles.grid}>
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
    </section>
  );
}
