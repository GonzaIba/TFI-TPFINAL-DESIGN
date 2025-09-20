'use client';

import { useState, useMemo, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Plus, Filter } from 'lucide-react';
import styles from './liveHelpFilters.module.css';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SearchIcon from '@mui/icons-material/Search';
import { Button, Input, SideBarFilters } from '@/components';
import { GroupEnum } from '@/lib/types/enum';
import { Colors } from '@/theme/colors'

type Props = {
  defaultQuery?: string;
  defaultTags?: string[]; // chips ya aplicadas (si venís desde la URL)
  onApply: (payload: { query: string; tags: string[] }) => void; // <-- se llama SOLO al aplicar
};

const MAX_TAGS = 10;

const chipVariants = {
  hidden: { opacity: 0, scale: 0.5, y: -10 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit:    { opacity: 0, scale: 0.5, y: 10 }
}

export default function LiveHelpFilters({
  defaultQuery = '',
  defaultTags = [],
  onApply,
}: Props) {
  const [showHelpFilters, setShowHelpFilters] = useState(false)
  const [query, setQuery] = useState(defaultQuery);
  const [tagInput, setTagInput] = useState('');
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [appliedTags, setAppliedTags] = useState<string[]>(
    defaultTags.map((t) => t.trim()).filter(Boolean)
  );

  const canAdd = useMemo(
    () =>
      tagInput.trim().length > 0 &&
      new Set(
        [...appliedTags, ...draftTags].map((t) => t.toLowerCase().trim())
      ).size < MAX_TAGS,
    [tagInput, draftTags, appliedTags]
  );

  const handleManageFilters = async () => {
    setShowHelpFilters(prev => !prev)
  }

  const handleGuardarFiltrosUsuario = async (valuePairs: Record<number, string>) => {
    // const filtered = Object.fromEntries(
    //   Object.entries(valuePairs).filter(([_, v]) => v.trim() !== '')
    // )
    // await usuariosForoService.addFilterUser({ filters_CodeValue: filtered })
    // const nuevosFiltros = (await usuariosForoService.getFilterUser()).data
    // setUserFilters(nuevosFiltros ?? [])
    // setShouldReloadUsers(true)
  }

  const handleResetearFiltros = async () => {
    // if(userFilters.length > 0) {
    //   await usuariosForoService.deleteFilterUser(GroupEnum.ForumUserTable)
    //   const filtrosActualizados = (await usuariosForoService.getFilterUser()).data
    //   setUserFilters(filtrosActualizados ?? [])
    //   setShouldReloadUsers(true)
    // }
  }

  const handleEliminarFiltro = async (codigoFiltro: number) => {
    // await usuariosForoService.deleteFilterUser(codigoFiltro)
    // const filtrosActualizados = (await usuariosForoService.getFilterUser()).data
    // setUserFilters(filtrosActualizados ?? [])
    // setShouldReloadUsers(true)
  }

  function addDraftTag(raw: string) {
    const parts = raw
      .split(/[,\n;]/g)
      .map((s) => s.trim())
      .filter(Boolean);

    if (parts.length === 0) return;

    const lowerAll = new Set(
      [...appliedTags, ...draftTags].map((t) => t.toLowerCase())
    );

    const next: string[] = [];
    for (const p of parts) {
      const key = p.toLowerCase();
      if (!lowerAll.has(key) && (appliedTags.length + draftTags.length + next.length) < MAX_TAGS) {
        next.push(p);
        lowerAll.add(key);
      }
    }
    if (next.length > 0) setDraftTags((d) => [...d, ...next]);
    setTagInput('');
    setQuery('');
  }

  function onTagKeyDown(query: string) {
    addDraftTag(query);
  }

  function removeDraft(tag: string) {
    setDraftTags((d) => d.filter((t) => t !== tag));
  }

  function removeApplied(tag: string) {
    const next = appliedTags.filter((t) => t !== tag);
    setAppliedTags(next);
    onApply({ query, tags: next }); // al quitar aplicado, disparamos backend
  }

  function applyAll() {
    const finalTags = Array.from(new Set([...appliedTags, ...draftTags]));
    setAppliedTags(finalTags);
    setDraftTags([]);
    onApply({ query, tags: finalTags }); // <-- acá llamás al backend
  }

  function clearAll() {
    setQuery('');
    setTagInput('');
    setDraftTags([]);
    setAppliedTags([]);
    onApply({ query: '', tags: [] });
  }

  return (
    <section className={styles.filters}>
      <div className={styles.filterContainer}>
        {/* fila buscador */}
        <div className={styles.searchRow}>
          <Input
            placeHolder="Buscar por texto en la descripción (ej: EF Core, XSS, Docker)"
            onInput={e => setQuery(e.target.value)}
            value={query}
            customStyle={{ height: '50px', fontSize: '16px', backgroundColor: '#121212' }}
            useSearch={false}
            showIcon={false}
            useClear={true}
          />

          <Button
            transparent
            onClick={() => console.log('Buscar')}
            icon={<SearchIcon sx={{ color: Colors.primary }} fontSize='large' />}
            width="40px"
          />

          <Button
            transparent
            onClick={() => console.log('Limpiar')}
            icon={<RestartAltIcon sx={{ color: Colors.primary }} fontSize='large' />}
            width="40px"
          />
        </div>

        <SideBarFilters
          show={showHelpFilters}
          closeFunction={handleManageFilters}
          saveFunction={handleGuardarFiltrosUsuario}
          resetFunction={handleResetearFiltros}
          onCompleted={handleManageFilters}
          grupo={GroupEnum.ForumRequestHelp}
        />

        {/* chips aplicadas */}
        <div className={styles.appliedRow}>
          <AnimatePresence initial={false}>
            {appliedTags.map((t) => (
              <motion.span
                key={`applied-${t}`}
                className={`${styles.chip} ${styles.chipApplied}`}
                initial={{ opacity: 0, scale: 0.9, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              >
                {t}
                <button
                  className={styles.chipClose}
                  onClick={() => removeApplied(t)}
                  aria-label={`Quitar ${t}`}
                  title="Quitar filtro"
                >
                  <X size={12} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
