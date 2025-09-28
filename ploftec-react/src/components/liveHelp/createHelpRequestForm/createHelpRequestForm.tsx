"use client";

import { useMemo, useState, useEffect } from 'react';
import styles from './createHelpRequestForm.module.css';
import { Button, Input, ChipComponent } from '@/components';
import Editor from '@/components/editorComponent/editor';
import { ThemeProvider, Slider, Box } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { darkTheme } from '@/theme/mui';
import { useRouter, useSearchParams } from 'next/navigation';
import { labelsService } from '@/lib/services/forum/labelsService';
import { requestHelpService } from '@/lib/services/forum/requestHelpService';
import { motion, AnimatePresence } from 'framer-motion';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { LabelFiltersEnum } from '@/lib/types/enum';

type Slot = { start: Date | null; end: Date | null };

type Props = {
  onCreated?: () => void;
  onCancel?: () => void;
};

// Sugeridos: se cargan dinámicamente desde labelsService (máximo 10)

export default function CreateHelpRequestForm({ onCreated, onCancel }: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const qs = sp.toString();
  const base = `/forum/liveHelp${qs ? `?${qs}` : ''}`;

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [reward, setReward] = useState<number>(5);
  const [suggestedLabels, setSuggestedLabels] = useState<string[]>([]);
  const [baseSuggested, setBaseSuggested] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(['es-AR']);
  const [labelsInput, setLabelsInput] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [slots, setSlots] = useState<Slot[]>([{ start: null, end: null }]);
  const [submitting, setSubmitting] = useState(false);
  const [errorTitle, setErrorTitle] = useState(false);
  const [errorTitleText, setErrorTitleText] = useState('Ingrese un título');
  const [errorContent, setErrorContent] = useState(false);
  const [errorContentText, setErrorContentText] = useState('Describe el problema con más detalle (20+ caracteres).');
  const [errorSlots, setErrorSlots] = useState(false);
  const [errorSlotsText, setErrorSlotsText] = useState('Agrega al menos una franja válida (inicio y fin).');
  const [errorLabels, setErrorLabels] = useState(false);
  const [errorLabelsText, setErrorLabelsText] = useState('Agrega al menos 2 etiquetas.');
  const [errorLabelInput, setErrorLabelInput] = useState(false);
  const [errorLabelInputText, setErrorLabelInputText] = useState('Máximo 30 caracteres.');

  const [errorLanguages, setErrorLanguages] = useState(false);
  const [errorLanguagesText] = useState('Selecciona al menos un idioma.');
  const plainContent = useMemo(() => (content || '').replace(/<[^>]+>/g, '').trim(), [content]);
  const contentTooShort = useMemo(() => plainContent.length > 0 && plainContent.length < 20, [plainContent]);
  const hasValidSlot = useMemo(() => {
    return slots.some((s) => {
      if (!s.start || !s.end) return false;
      const diffMin = Math.round((+s.end - +s.start) / 60000);
      return diffMin === 15 || diffMin === 30; // sólo 15 o 30 minutos
    });
  }, [slots]);

    // Cargar sugerencias desde el servicio de etiquetas (máximo 10)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await labelsService.getLabelsByFilter(LabelFiltersEnum.MostPopular, 1, 10);
        const list = resp.data?.list ?? [];
        if (mounted) {
          const names = list.map((x) => x.name);
          setSuggestedLabels(names);
          setBaseSuggested(names);
        }
      } catch {}
    })();
    return () => { mounted = false };
  }, []);

  function toggleSuggested(label: string) {
    setLabels((prev) => {
      const exists = prev.includes(label);
      const next = exists ? prev.filter((x) => x !== label) : [...prev, label];
      if (errorLabels && next.length >= 2) setErrorLabels(false);
      return next;
    });
  }

  function addLabelFromInput() {
    const v = labelsInput.trim();
    if (!v) return;
    if (v.length > 30) { setErrorLabelInput(true); setErrorLabelInputText('Máximo 30 caracteres.'); return; }
    setLabels((prev) => {
      const next = prev.includes(v) ? prev : [...prev, v];
      if (errorLabels && next.length >= 2) setErrorLabels(false);
      return next;
    });
    setLabelsInput('');
  }

  function removeLabel(l: string) {
    setLabels((prev) => prev.filter((x) => x !== l));
    setSuggestedLabels((prev) => {
      if (!baseSuggested.includes(l)) return prev;
      return prev.includes(l) ? prev : [l, ...prev];
    });
  }

  function addSlot() { setSlots((s) => [...s, { start: null, end: null }]); }
  function removeSlot(i: number) { setSlots((s) => s.filter((_, idx) => idx !== i)); }

  function toggleLanguage(code: string) {
    setLanguages((prev) => {
      const next = prev.includes(code) ? prev.filter((x) => x !== code) : [...prev, code];
      if (errorLanguages && next.length > 0) setErrorLanguages(false);
      return next;
    });
  }

  async function handleSubmit() {
    let canSubmit = true;
    if (!title.trim()) { setErrorTitle(true); setErrorTitleText('Ingrese un título'); canSubmit = false; }
    if (plainContent.length < 20) { setErrorContent(true); setErrorContentText('Describe el problema con más detalle (20+ caracteres).'); canSubmit = false; }
    if (!hasValidSlot) { setErrorSlots(true); canSubmit = false; }
    if (labels.length < 2) { setErrorLabels(true); canSubmit = false; }
    if (languages.length === 0) { setErrorLanguages(true); canSubmit = false; }
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const slotsPayload = slots
        .filter((s) => s.start && s.end)
        .map((s) => ({ start: new Date(s.start!).toISOString(), end: new Date(s.end!).toISOString() }));

      const payload = {
        titleHelp: title.trim(),
        message: content,
        labels,
        languages,
        timeSlot: { slots: slotsPayload },
      };

      await requestHelpService.createHelpRequest(payload as any);
      onCreated ? onCreated() : router.push(base);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <div className={styles.wrap}>
        {/* Left column: Title + Description */}
        <section className={styles.section} aria-label="Contenido">
          <div className={styles.titleRow}><h3>Describe tu solicitud</h3></div>

          <div className={styles.inputRow}>
            <Input
              placeHolder="Título claro y específico"
              value={title}
              onInput={(e) => {
                const val = (e.target as HTMLInputElement).value;
                setTitle(val);
                if (errorTitle && val.trim() !== '') setErrorTitle(false);
              }}
              customStyle={{ height: '50px', fontSize: '16px' }}
              useSearch={false}
              showIcon={false}
              error={errorTitle}
              errorText={errorTitleText}
              useClear
            />
          </div>

          <Editor
            initialContent="<p>Explica el contexto, qué intentaste y qué esperas lograr.</p>"
            isInternal
            onChangeContent={setContent}
          />
          {(errorContent || contentTooShort) && (
            <div className={styles.error}>{errorContentText}</div>
          )}

          <div className={styles.actionsDesktop}>
            <Button transparent text="Cancelar" onClick={() => onCancel ? onCancel() : router.push(base)} />
            <Button text="Publicar solicitud" onClick={handleSubmit} loading={submitting} />
          </div>
        </section>

        {/* Right column: Options */}
        <aside className={`${styles.section} ${styles.sidebarGroup}`} aria-label="Opciones">
          {/** Recompensa: asignada fijo por backend. Se oculta en UI.
          <div>
            <div className={styles.titleRow}><h3>Recompensa</h3></div>
            <Box px={1}>
              <Slider value={reward} onChange={(_, v) => setReward(v as number)} min={0} max={100} step={1} />
            </Box>
          </div>
          */}

          <div>
            <div className={styles.titleRow}><h3>Sugeridos</h3></div>
            <div className={styles.chipList}>
              <AnimatePresence>
                {suggestedLabels
                  .filter((s) => !labels.includes(s))
                  .map((name) => (
                    <motion.div
                      key={`sugg-${name}`}
                      layout
                      initial={{ opacity: 0, scale: 0.5, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.5, y: 10 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className={styles.chipContainer}
                    >
                      <ChipComponent
                        label={name}
                        button={<Button width='10px' borderRadius='10px' height='0px' icon={<AddIcon />} transparent onClick={() => toggleSuggested(name)} />}
                      />
                    </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div>
            <div className={styles.titleRow}><h3>Etiquetas</h3></div>
            <Input
              placeHolder="Añade y presiona Enter"
              value={labelsInput}
              onInput={(e) => {
                const v = (e.target as HTMLInputElement).value;
                setLabelsInput(v);
                if (errorLabelInput && v.length <= 30) setErrorLabelInput(false);
              }}
              submitFunction={addLabelFromInput}
              useSearch={false}
              showIcon={false}
              useClear
            />
            {errorLabelInput && (
              <div className={styles.error} style={{ marginTop: 6 }}>{errorLabelInputText}</div>
            )}
            <div className={styles.chipList} style={{ marginTop: 8 }}>
              <AnimatePresence>
                {labels.map((l) => (
                  <motion.div
                    key={`sel-${l}`}
                    layout
                    initial={{ opacity: 0, scale: 0.5, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 10 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={styles.chipContainer}
                  >
                    <ChipComponent
                      label={l}
                      button={
                        <Button
                          width='10px'
                          borderRadius='10px'
                          height='0px'
                          icon={<CloseIcon />}
                          transparent
                          onClick={() => { removeLabel(l); if (errorLabels && labels.length - 1 >= 2) setErrorLabels(false); }}
                        />
                      }
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            {errorLabels && labels.length < 2 && (
              <div className={styles.error}>{errorLabelsText}</div>
            )}
          </div>

          <div>
            <div className={styles.titleRow}><h3>Disponibilidad</h3></div>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <div className={styles.slots}>
                {slots.map((s, i) => (
                  <div className={styles.slotItem} key={`slot-${i}`}>
                        <DateTimePicker
                          label="Inicio"
                          value={s.start}
                          minDateTime={new Date()}
                          onChange={(d) => setSlots((prev) => {
                            // No permitir fecha anterior a 'ahora'
                            const safeStart = d ? new Date(Math.max(+d, Date.now())) : null;
                            const next = prev.map((x, idx) => idx === i ? { ...x, start: safeStart } : x);
                            // Si cambia el inicio, invalidamos FIN si ya no cumple regla 15/30
                            const cur = next[i];
                            if (cur.end && cur.start) {
                              const diff = (+cur.end - +cur.start) / 60000;
                              if (!(diff === 15 || diff === 30)) {
                                next[i] = { ...cur, end: null };
                              }
                            }
                            if (errorSlots) {
                              const valid = next.some(v => v.start && v.end && ((+v.end - +v.start) === 15*60000 || (+v.end - +v.start) === 30*60000));
                              if (valid) setErrorSlots(false);
                            }
                            return next;
                          })}
                        />
                    <DateTimePicker
                      label="Fin"
                      value={s.end}
                      minutesStep={15}
                      disabled={!s.start}
                      minDateTime={s.start ? new Date(+s.start + 15 * 60000) : undefined}
                      maxDateTime={s.start ? new Date(+s.start + 30 * 60000) : undefined}
                      onChange={(d) => setSlots((prev) => {
                        let end = d ?? null;
                        const start = prev[i].start;
                        if (end && start) {
                          const m15 = new Date(+start + 15 * 60000);
                          const m30 = new Date(+start + 30 * 60000);
                          // Forzamos sólo 15 o 30 minutos desde inicio, elegimos la más cercana
                          const d15 = Math.abs(+end - +m15);
                          const d30 = Math.abs(+end - +m30);
                          end = d15 <= d30 ? m15 : m30;
                        }
                        const next = prev.map((x, idx) => idx === i ? { ...x, end } : x);
                        if (errorSlots) {
                          const valid = next.some(v => v.start && v.end && ((+v.end - +v.start) === 15*60000 || (+v.end - +v.start) === 30*60000));
                          if (valid) setErrorSlots(false);
                        }
                        return next;
                      })}
                    />
                    <Button
                      onClick={() => removeSlot(i)}
                      transparent
                      text="Quitar"
                      width="88px"
                    />
                  </div>
                ))}
              </div>
            </LocalizationProvider>
            <div style={{ marginTop: 8 }}>
              <Button onClick={addSlot} transparent text="Agregar franja" />
            </div>
            {errorSlots && !hasValidSlot && (
              <div className={styles.error} style={{ marginTop: 8 }}>{errorSlotsText}</div>
            )}
          </div>

          <div>
            <div className={styles.titleRow}><h3>Idiomas</h3></div>
            <div className={styles.chips}>
                {['es-AR', 'en-US'].map((code) => {
                  const active = languages.includes(code);
                  return (
                  <div
                    key={code}
                    className={`${styles.chip} ${active ? styles.active : ''}`}
                    onClick={() => toggleLanguage(code)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') toggleLanguage(code); }}
                    aria-pressed={active}
                  >
                    {code}
                  </div>
                  );
                })}
              </div>
            {errorLanguages && languages.length === 0 && (
              <div className={styles.error} style={{ marginTop: 6 }}>{errorLanguagesText}</div>
            )}
          </div>
        </aside>

        {/* Mobile-only actions at the very bottom */}
        <div className={styles.actionsMobile}>
          <Button transparent text="Cancelar" onClick={() => onCancel ? onCancel() : router.push(base)} />
          <Button text="Publicar solicitud" onClick={handleSubmit} loading={submitting} />
        </div>
      </div>
    </ThemeProvider>
  );
}
