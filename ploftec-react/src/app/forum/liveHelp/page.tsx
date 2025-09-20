// src/app/Forum/Labels/page.tsx
'use client';

import styles from './page.module.css';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button, Grid, GridItem, Input, SideBarFilters, RequestHelpFeed } from '@/components';
import { UserFilterForumResponse } from '@/lib/types/forum';
import { filtrosService } from "@/lib/services/forum/filtrosService";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import SearchIcon from '@mui/icons-material/Search';
import { GroupEnum } from '@/lib/types/enum';
import { Colors } from '@/theme/colors';

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

  const handleManageFilters = async () => setShowHelpFilters(p => !p);

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
    const filtered = Object.fromEntries(
      Object.entries(valuePairs).filter(([_, v]) => v.trim() !== '')
    )
    await filtrosService.addFilterUser({ filters_CodeValue: filtered })
    const nuevosFiltros = (await filtrosService.getFilterUser(GroupEnum.ForumRequestHelp)).data
    setUserFilters(nuevosFiltros ?? [])
    setShouldReloadUsers(true)
  }

  const handleResetearFiltros = async () => {
    if(userFilters.length > 0) {
      await filtrosService.deleteFilterUser(GroupEnum.ForumUserTable)
      const filtrosActualizados = (await filtrosService.getFilterUser(GroupEnum.ForumUserTable)).data
      setUserFilters(filtrosActualizados ?? [])
      setShouldReloadUsers(true)
    }
  }

  useEffect(() => {
    const loadFilters = async () => {
      const filtros = (await filtrosService.getFilterUser(GroupEnum.ForumRequestHelp)).data
      setUserFilters(filtros ?? [])
    }
    loadFilters()
  }, [])

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

        <div className={styles.filterContainer}>
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

          {/* Espaciador derecho para mantener el centro perfecto */}
          <div />
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

        {/* Feed */}
        <div className={styles.feedContainer}>
          <RequestHelpFeed
            pageSize={9}
            search={appliedSearch}
            onCountChange={(visible, more) => { setVisibleCount(visible); setHasMore(more); }}
          />
        </div>
      </motion.section>
    </div>
  );
}
