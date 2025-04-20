'use client'

import { Eye, MessageSquare, ThumbsUp } from 'lucide-react'
import { PublicationResponse } from '@/lib/types/forum'
import { getPublicationTimeAgo } from '@/lib/helpers/timeHelper'
import AvatarUser from '@/components/avatarUserComponent/avatarUser'
import Button from '@/components/buttonComponent/button'

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

  const iconButtonClass = `${publication.estaGuardado ? "bx bxs-bookmark saved" : "bx bx-bookmark"}`;

  return (
    <div className="question">
      <div className="avatarUser" onClick={onClickUser}>
        <AvatarUser tagUser="JL" /> {/*REVISAR INICIALES*/}
      </div>
      <div className="questionBody">
        <div className="questionHeader">
          <div onClick={onClickTitle} style={{ display: 'inline-block' }}>
            <h4>{publication.titulo}</h4>
          </div>
          <div className="saveIcon">
            <Button executeFunction={onToggleSave} width="100%" displayText='' iconClass={iconButtonClass} transparentContainer />
            {/*REVISAR PORQUE SIEMPRE TRASPARENT TRUE???*/}
          </div>
        </div>

        <div className="questionStadistics">
          <div className="question-item">
            <span className="question-icon">
              <MessageSquare size={16} />
            </span>
            <span className="question-count">{publication.respuestas}</span>
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
            <span className="question-count">{publication.visitas}</span>
            <span className="question-text">Visitas</span>
          </div>
        </div>

        <div className="questionMore">
          <div className="tagList">
            {publication.etiquetas.map((tag, idx) => (
              <span key={idx} className="tag">
                {tag}
              </span>
            ))}
          </div>
          <div className="questionDate">
            <span>{getPublicationTimeAgo("Preguntado", new Date(publication.fechaCreacion))}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
