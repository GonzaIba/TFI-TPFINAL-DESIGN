'use client'

import React, { useState, useEffect } from 'react'
import { Eye, MessageSquare, ThumbsUp } from 'lucide-react'
import { PublicationResponse } from '@/lib/types/forum'
import { getPublicationTimeAgo, truncate } from '@/lib/helpers'
import { Button, AvatarUser} from '@/components'
import { Bookmark, BookmarkBorder } from '@mui/icons-material';
import { Colors } from '@/theme/colors'
import { motion, AnimatePresence } from 'framer-motion';
import styles from './publicationCard.module.css'
import { useWindowWidth } from '@/hooks';

type PublicationCardProps = {
  publication: PublicationResponse
  onClickTitle: () => Promise<void>
  onClickUser: () => Promise<void>
  onToggleSave: () => Promise<void>
}


export default function PublicationCard({
  publication,
  onClickTitle,
  onClickUser,
  onToggleSave,
}: PublicationCardProps) {

  const width = useWindowWidth();
  const [isMobile, setIsMobile] = useState(width < 768)
  const isSmallPhone = width <= 360; // ajusta avatar en pantallas muy chicas

  useEffect(() => {
    setIsMobile(width < 768)
  }, [width])

  return (
    <div className={styles.question}>
      <div className={styles.questionAvatarUser} onClick={onClickUser}>
        <AvatarUser 
          tagUser={publication.userCreator?.initials ?? "AU"} 
          imageUser={publication.userCreator?.image}
          descripcionCorta={publication.userCreator?.shortDescription ?? ''}
          descripcionLarga={publication.userCreator?.longDescription ?? ''}
          nombreCompleto={publication.userCreator?.completeName ?? ''}
          direction='right' 
          size={isSmallPhone ? 32 : 40}
        /> {/*Anonimous User*/}
      </div>
      <div className={styles.questionBody}>
        <div className={styles.questionHeader}>
          <div onClick={onClickTitle} style={{ display: 'inline-block' }}>
            <h4 className={styles.titleEllipsis}>{publication.title}</h4>
          </div>
        </div>

        <div className={styles.questionStadistics}>
          <div className={styles.questionItem}>
            <span className={styles.questionIcon}>
              <MessageSquare size={16} />
            </span>
            <span className={styles.questionCount}>{publication.answers}</span>
            {!isMobile && <span className={styles.questionText}>Respuestas</span>}
          </div>
          <div className={styles.questionItem}>
            <span className={styles.questionIcon}>
              <ThumbsUp size={16} />
            </span>
            <span className={styles.questionCount}>{29}</span> {/* REVISAR!!!!!!!! */}
            {!isMobile && <span className={styles.questionText}>Votos</span>}
          </div>
          <div className={styles.questionItem}>
            <span className={styles.questionIcon}>
              <Eye size={16} />
            </span>
            <span className={styles.questionCount}>{publication.visits}</span>
            {!isMobile && <span className={styles.questionText}>Visitas</span>}
          </div>
        </div>

        <div className={styles.questionMore}>
          <div className={styles.tagList}>
            {publication.tags.map((tag, idx) => (
              <span key={idx} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
          <div className={styles.questionDate}>
            <span>{getPublicationTimeAgo("Preguntado", new Date(publication.createdDate))}</span>
          </div>
        </div>
      </div>

      <div className={styles.saveIcon}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={publication?.isSaved ? 'saved' : 'unsaved'}
            initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className={styles.buttonSaveContainer}
          >
            <Button
              transparent
              onClick={onToggleSave}
              icon={publication?.isSaved ? <Bookmark sx={{ color: Colors.primary }} fontSize='large' /> : <BookmarkBorder sx={{ color: Colors.white }} fontSize='large' />}
              width="40px"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
