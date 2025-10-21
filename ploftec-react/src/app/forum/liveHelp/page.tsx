// src/app/Forum/Labels/page.tsx
'use client';

import styles from './page.module.css';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo, useEffect, useCallback } from 'react';
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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.18 } }, // escalonado limpio
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
              <div className={styles.mySectionContainer}>
                <RequestHelpConfirmedFeed items={confirmedRequests} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mis solicitudes de ayuda */}
        <h2 className={styles.sectionTitle}>Mis solicitudes de ayuda</h2>
        <div className={styles.mySectionContainer}>
          <MyRequestHelpFeed
            enabled={feedEnabled && isAuthLoaded && isAuthenticated}
            isAuthenticated={isAuthenticated}
            isAuthLoaded={isAuthLoaded}
          />
        </div>

        <div className={styles.filterContainer} style={{ paddingBottom: userFilters.length > 0 ? 0 : 24 }}>
          <div className={styles.totalBox}>
            <span className={styles.totalLabel}>Total solicitudes: </span>
            <strong className={styles.totalValue}>
              {visibleCount}{hasMore ? '+' : ''}
            </strong>
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
        <div className={styles.feedContainer}>
          <RequestHelpFeed
            pageSize={9}
            search={appliedSearch}
            refresh={refreshCounter}
            enabled={feedEnabled}
            onCountChange={handleCountChange}
          />
        </div>
      </motion.section>
    </div>
  );
}
