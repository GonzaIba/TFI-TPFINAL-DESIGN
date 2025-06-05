'use client'

import { Eye, MessageSquare, ThumbsUp } from 'lucide-react'
import { PublicationResponse } from '@/lib/types/forum'
import { getPublicationTimeAgo } from '@/lib/helpers/timeHelper'
import AvatarUser from '@/components/avatarUserComponent/avatarUser'
import Button from '@/components/buttonComponent/button'
import { Bookmark, BookmarkBorder } from '@mui/icons-material';
import { Colors } from '@/theme/colors'
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="question">
      <div className="avatarUser" onClick={onClickUser}>
        <AvatarUser tagUser="JL" /> {/*REVISAR INICIALES*/}
      </div>
      <div className="questionBody">
        <div className="questionHeader">
          <div onClick={onClickTitle} style={{ display: 'inline-block' }}>
            <h4>{publication.title}</h4>
          </div>
          <div className="saveIcon">
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

        <div className="questionStadistics">
          <div className="question-item">
            <span className="question-icon">
              <MessageSquare size={16} />
            </span>
            <span className="question-count">{publication.answers}</span>
            <span className="question-text">Respuestas</span>
          </div>
          <div className="question-item">
            <span className="question-icon">
              <ThumbsUp size={16} />
            </span>
            <span className="question-count">{29}</span> {/* REVISAR!!!!!!!! */}
            <span className="question-text">Votos</span>
          </div>
          <div className="question-item">
            <span className="question-icon">
              <Eye size={16} />
            </span>
            <span className="question-count">{publication.visits}</span>
            <span className="question-text">Visitas</span>
          </div>
        </div>

        <div className="questionMore">
          <div className="tagList">
            {publication.tags.map((tag, idx) => (
              <span key={idx} className="tag">
                {tag}
              </span>
            ))}
          </div>
          <div className="questionDate">
            <span>{getPublicationTimeAgo("Preguntado", new Date(publication.createdDate))}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
