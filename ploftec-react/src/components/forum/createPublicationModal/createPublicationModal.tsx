// src/components/forum/createPublicationComponent.tsx

import React, { useState, ChangeEvent, useEffect } from 'react'
import EditorInput from '@/components/editorComponent/editor'
import { Button, Input, ChipComponent } from '@/components';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import styles from './createPublicationModal.module.css'
import { useWindowWidth } from '@/hooks';
import { publicationsService } from '@/lib/services/forum/publicationsService';
import { useDebounce } from '@/hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion'
import { GenericApiResponse } from '@/lib/types/apiResponse';
import { CreatePublicationRequest } from '@/lib/types/forum';

export interface CreatePublicationProps {
  initialDraft?: string
  loadingSubmit?: boolean
  onSubmit: (data: CreatePublicationRequest) => void
  close: () => void;
}

interface Tag {
  id: string;
  tagText: string;
  isSuggest: boolean;
}

const chipVariants = {
  hidden: { opacity: 0, scale: 0.5, y: -10 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit:    { opacity: 0, scale: 0.5, y: 10 }
}

const CreatePublicationComponent: React.FC<CreatePublicationProps> = ({
  initialDraft = '',
  loadingSubmit,
  onSubmit,
  close
}) => {
  const width = useWindowWidth();
  const isMobile = width < 720;
  const [title, setTitle] = useState('')
  const [content, setContent] = useState(initialDraft)
  const [tagsText, setTagsText] = useState('')
  const [tags, setTags] = useState<Tag[]>([])
  const [errorTag, setErrorTag] = useState(false)
  const [errorTagText, setErrorTagText] = useState('Ingresa al menos una etiqueta')
  const [errorTitle, setErrorTitle] = useState(false)
  const [errorTitleText, setErrorTitleText] = useState('Ingresa al menos una etiqueta')
  
  // --- nuevo estado para sugerencias ---
  const [suggestedTags, setSuggestedTags] = useState<Tag[]>([]);

  // Debounce sobre tagsText (500 ms tras última pulsación)
  const debouncedTagsText = useDebounce(title, 1000);

  useEffect(() => {
    if (!debouncedTagsText.trim()) {
      setSuggestedTags([]);
      return;
    }

    const fetchPredictedLabels = async () => {
      try {
        const res = await publicationsService.predictLabels(debouncedTagsText) as GenericApiResponse<string[]>;
        const predictions = res.data ?? [];

        // 1) Excluimos los tags ya seleccionados
        const existingSelected = new Set(tags.map(t => t.tagText));

        // 2) Creamos el array completo de sugerencias de la API
        const apiSuggestions: Tag[] = predictions
          .filter(p => !existingSelected.has(p))
          .map(p => ({ id: p, tagText: p, isSuggest: true }));

        // 3) Ahora mezclamos con el estado previo para poner las "nuevas" arriba
        setSuggestedTags(prev => {
          // a) identificamos los ids que vinieron de la API
          const apiIds = new Set(apiSuggestions.map(s => s.id));

          // b) cuáles de las apiSuggestions no estaban ya en prev → estas son "nuevas"
          const justArrived = apiSuggestions.filter(s => !prev.some(p => p.id === s.id));

          // c) cuáles de los prev siguen en la lista de la API → las mantenemos
          const stillValid = prev.filter(p => apiIds.has(p.id));

          return [...justArrived, ...stillValid];
        });
      } catch (err) {
        console.error('Error al predecir etiquetas:', err);
      }
    };

    fetchPredictedLabels();
  }, [debouncedTagsText]);

  const handleSubmit = () => {
    let canSubmit = true;
    if(title === ""){
      setErrorTitle(true)
      setErrorTitleText("Ingrese un título")
      canSubmit = false
    }
    if(tags.length == 0){
      setErrorTag(true)
      setErrorTagText('Ingresa al menos un tag')
      canSubmit = false
    }

    if(canSubmit)
      onSubmit({ title, content, labels: tags.map(x=> x.tagText) });
  };

  const handleOnInput = (e:any) => {
    setTagsText(e.target.value)
    if(errorTag)
      setErrorTag(false)
  }

  const handleSetTitle = (text : string) => {
    if(text.length > 150){
      setErrorTitle(true)
      setErrorTitleText("Maximo 150 caracteres")
    }

    setTitle(text)

    if(errorTitle)
      setErrorTitle(false)
  }

  const handleAddTag = () => {
    if (tagsText.trim() === '') {
      setErrorTag(true)
      setErrorTagText('Ingresa al menos un caracter')
      return
    }
    else if(tagsText.length > 15) {
      setErrorTag(true)
      setErrorTagText('Ingresa menos de 15 caracteres')
      return
    }

    setTags(prev => [...prev, { id: crypto.randomUUID(), tagText: tagsText.trim(), isSuggest: false }])
    setTagsText('')
    setErrorTag(false)
  }

  const handleAddSuggestedTag = (tag: Tag) => {
    // 1) lo agrego a tags (si querés conservar el mismo id podés reusarlo)
    setTags(prev => [
      ...prev, 
      { ...tag, isSuggest: true, id: crypto.randomUUID() }
    ])
    // 2) lo saco de suggestedTags filtrando por id
    setSuggestedTags(prev => prev.filter(t => t.id !== tag.id))
  }


  const handleRemoveTag = (index: number) => {
    // Capturamos el tag que vamos a eliminar
    const removedTag = tags[index];

    // 1) Eliminamos de 'tags'
    setTags(prev => prev.filter((_, i) => i !== index));

    // 2) Si era sugerido, lo volvemos a poner en suggestedTags
    if (removedTag.isSuggest) {
      setSuggestedTags(prev => [...prev, removedTag]);
    }
  };


  return (
    <div className={styles.container}>
      <div className={styles.form}>
        {/* TÍTULO */}
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Título
              <span className={styles.required}>*</span>
              <Tooltip enterTouchDelay={0} leaveTouchDelay={3500} arrow disableInteractive title="Imagina que estas haciendo una publicacion de hacking ético.">
                <InfoOutlineIcon/>
              </Tooltip>
          </label>
          <Input
            placeHolder="¿De que tema querés abordar? Sé específico."
            onInput={e => handleSetTitle(e.target.value)}
            customStyle={{ height: '50px', fontSize: '16px' }}
            useSearch={false}
            showIcon={false}
            error={errorTitle}
            errorText={errorTitleText}
          />
        </div>

        {/* SUGERIDAS */}
        {title != "" && (
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Sugeridos
            </label>
            <div className={styles.chipList}>
              <AnimatePresence>
                {suggestedTags.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    layout
                    variants={chipVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className={styles.chipContainer}
                  >
                    <ChipComponent label={item.tagText} button={<Button width='10px' borderRadius='10px' height='0px' icon={<AddIcon></AddIcon>} transparent onClick={() => handleAddSuggestedTag(item)} />}></ChipComponent>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ETIQUETAS */}
        <div className={styles.formGroup}>
          <label htmlFor="tags" className={styles.label}>
            Etiquetas
              <span className={styles.required}>*</span>
              <Tooltip enterTouchDelay={0} leaveTouchDelay={3500} arrow disableInteractive title="Añade hasta 5 etiquetas para describir sobre qué trata tu publicación">
                <InfoOutlineIcon/>
              </Tooltip>
          </label>
          <div className={styles.tagContainer}>
          <Input
            placeHolder='p. ej. hacking veracode redhat'
            value={tagsText}                                   // <— pasas el estado
            onInput={(e: ChangeEvent<HTMLInputElement>) => handleOnInput(e)}              
            customStyle={{height: '50px', fontSize: '16px'}}
            widthContainer={isMobile ? '100%' : '300px'}
            useSearch={false}
            showIcon={false}
            error={errorTag}
            errorText={errorTagText}
          >
            </Input>
            <div className={styles.addTag}>
              <Button circular onClick={handleAddTag} icon={<AddIcon></AddIcon>}/>
            </div>

            {/* Aquí animamos los chips */}
            <div className={styles.chipList}>
              <AnimatePresence>
                {tags.map((item, idx) => (
                <motion.div
                  key={item.id}
                  layout
                  variants={chipVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={styles.chipContainer}
                >
                  <ChipComponent 
                    label={item.tagText} 
                    button={
                      <Button 
                        width='10px' 
                        borderRadius='10px' 
                        height='0px' 
                        icon={<CloseIcon/>} 
                        transparent 
                        onClick={() => handleRemoveTag(idx)} 
                      />
                    }
                  />
                </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* CUERPO */}
        <div className={styles.formGroup}>
          <label htmlFor="body" className={styles.label}>
            Cuerpo
              <span className={styles.required}>*</span>
              <Tooltip enterTouchDelay={0} leaveTouchDelay={3500} arrow disableInteractive title="Incluye toda la información que alguien necesitaría para responder tu publicación">
                <InfoOutlineIcon/>
              </Tooltip>
          </label>
          <div className={styles.editorContainer}>
            <EditorInput
              isInternal
              initialContent={content}
              onChangeContent={(data) => {setContent(data)}}
            />
          </div>
        </div>

        {/* BOTÓN DE ENVÍO */}
        <div className={styles.formActions}>
          <Button onClick={handleSubmit} text='Publicar' loading={loadingSubmit} width={isMobile ? '100%' : '170px'}/>
          <Button onClick={close} text='Cancelar' width={isMobile ? '100%' : '170px'}/>
        </div>
      </div>
    </div>
  )
}

export default CreatePublicationComponent
