// src/components/forum/createPublicationComponent.tsx

import React, { useState, ChangeEvent, useEffect } from 'react'
import EditorInput from '@/components/editorComponent/editor'
import { Button, Input, ChipComponent } from '@/components';
import Tooltip from '@mui/material/Tooltip';
import InfoOutlineIcon from '@mui/icons-material/InfoOutline';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import styles from './createPublicationModal.module.css'
import { publicationsService } from '@/lib/services/forum/publicationsService';
import { useDebounce } from '@/hooks/useDebounce';
import { motion, AnimatePresence } from 'framer-motion'
import { GenericApiResponse } from '@/lib/types/apiResponse';

export interface CreatePublicationProps {
  initialDraft?: string
  onSubmit: (data: {
    title: string
    content: string
    tags: string
  }) => void
}

const chipVariants = {
  hidden: { opacity: 0, scale: 0.5, y: -10 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit:    { opacity: 0, scale: 0.5, y: 10 }
}

const CreatePublicationComponent: React.FC<CreatePublicationProps> = ({
  initialDraft = '',
  onSubmit,
}) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState(initialDraft)
  const [tagsText, setTagsText] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [errorTag, setErrorTag] = useState(false)
  const [errorTagText, setErrorTagText] = useState('Ingresa al menos una etiqueta')
  
  // --- nuevo estado para sugerencias ---
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);

  // Debounce sobre tagsText (500 ms tras última pulsación)
  const debouncedTagsText = useDebounce(tagsText, 500);

  // Efecto que llama a predictLabels cuando el usuario deja de escribir
  useEffect(() => {
    if (!debouncedTagsText.trim()) {
      setSuggestedTags([]);
      return;
    }

    const fetchPredictedLabels = async () => {
      try {
        const res = await publicationsService.predictLabels(debouncedTagsText);
        setSuggestedTags(res.data || []);
      }
    catch (err) {
        console.error('Error al predecir etiquetas:', err);
    }
    }

    fetchPredictedLabels();
  }, [debouncedTagsText]);

  // Validación de largo máximo
  const isTitleTooLong = title.length > 150;

  const handleSubmit = () => {
    if (isTitleTooLong) return; // opcional: prevenir submit cuando hay error
    onSubmit({ title, content, tags: tagsText });
  };

  const handleOnInput = (e:any) => {
    setTagsText(e.target.value)
    if(errorTag)
      setErrorTag(false)
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

    setTags(prev => [...prev, tagsText.trim()])
    setTagsText('')
    setErrorTag(false)
  }

  const handleRemoveTag = (index: number) => {
    setTags(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className={styles.container}>
      <div className={styles.form}>
        {/* TÍTULO */}
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Título
              <span className={styles.required}>*</span>
              <Tooltip title="Imagina que estas haciendo una publicacion de hacking ético.">
                <InfoOutlineIcon/>
              </Tooltip>
          </label>
          <Input
            placeHolder="¿De que tema querés abordar? Sé específico."
            onInput={e => setTitle(e.target.value)}
            customStyle={{ height: '50px', fontSize: '16px' }}
            useSearch={false}
            showIcon={false}
            error={isTitleTooLong}
            errorText="Maximo 150 caracteres"
          />
        </div>

        {/* ETIQUETAS */}
        <div className={styles.formGroup}>
          <label htmlFor="tags" className={styles.label}>
            Etiquetas
              <span className={styles.required}>*</span>
              <Tooltip title="Añade hasta 5 etiquetas para describir sobre qué trata tu publicación">
                <InfoOutlineIcon/>
              </Tooltip>
          </label>
          <div className={styles.tagContainer}>
            <Input
              placeHolder='p. ej. hacking veracode redhat'
              value={tagsText}                                   // <— pasas el estado
              onInput={(e: ChangeEvent<HTMLInputElement>) => handleOnInput(e)}              
              customStyle={{height: '50px', fontSize: '16px'}}
              widthContainer='300px'
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
                  key={item + idx}
                  variants={chipVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className={styles.chipContainer}
                >
                  <ChipComponent label={item} button={<Button width='10px' borderRadius='10px' height='0px' icon={<CloseIcon></CloseIcon>} transparent onClick={() => handleRemoveTag(idx)} />}></ChipComponent>
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
              <Tooltip title="Incluye toda la información que alguien necesitaría para responder tu publicación">
                <InfoOutlineIcon/>
              </Tooltip>
          </label>
          <div className={styles.editorContainer}>
            <EditorInput
              isInternal
              initialContent={content}
            />
          </div>
        </div>

        {/* BOTÓN DE ENVÍO */}
        <div className={styles.formActions}>
          <Button onClick={handleSubmit} text='Publicar'/>
        </div>
      </div>
    </div>
  )
}

export default CreatePublicationComponent
