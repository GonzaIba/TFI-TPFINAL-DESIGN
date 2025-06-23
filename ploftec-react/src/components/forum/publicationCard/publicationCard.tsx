'use client'

import { Eye, MessageSquare, ThumbsUp } from 'lucide-react'
import { PublicationResponse } from '@/lib/types/forum'
import { getPublicationTimeAgo, truncate } from '@/lib/helpers'
import { Button, AvatarUser} from '@/components'
import { Bookmark, BookmarkBorder } from '@mui/icons-material';
import { Colors } from '@/theme/colors'
import { motion, AnimatePresence } from 'framer-motion';
import styles from './publicationCard.module.css'

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

  return (
    <div className={styles.question}>
      <div className={styles.questionAvatarUser} onClick={onClickUser}>
        <AvatarUser tagUser="JL" /> {/*REVISAR INICIALES*/}
      </div>
      <div className={styles.questionBody}>
        <div className={styles.questionHeader}>
          <div onClick={onClickTitle} style={{ display: 'inline-block' }}>
            <h4 className={styles.titleEllipsis}>{publication.title}</h4>
          </div>
          <div className={styles.saveIcon}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={publication?.isSaved ? 'saved' : 'unsaved'}
                initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              >
                <Button
                  transparent
                  onClick={onToggleSave}
                  icon={publication?.isSaved ? <Bookmark sx={{ color: Colors.primary }} fontSize='large' /> : <BookmarkBorder sx={{ color: Colors.white }} fontSize='large' />}
                  width="40px"
                />
              </motion.div>
            </AnimatePresence>
            {/*REVISAR PORQUE SIEMPRE TRASPARENT TRUE???*/}
          </div>
        </div>

        <div className={styles.questionStadistics}>
          <div className={styles.questionItem}>
            <span className={styles.questionIcon}>
              <MessageSquare size={16} />
            </span>
            <span className={styles.questionCount}>{publication.answers}</span>
            <span className={styles.questionText}>Respuestas</span>
          </div>
          <div className={styles.questionItem}>
            <span className={styles.questionIcon}>
              <ThumbsUp size={16} />
            </span>
            <span className={styles.questionCount}>{29}</span> {/* REVISAR!!!!!!!! */}
            <span className={styles.questionText}>Votos</span>
          </div>
          <div className={styles.questionItem}>
            <span className={styles.questionIcon}>
              <Eye size={16} />
            </span>
            <span className={styles.questionCount}>{publication.visits}</span>
            <span className={styles.questionText}>Visitas</span>
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
    </div>
  )
}
