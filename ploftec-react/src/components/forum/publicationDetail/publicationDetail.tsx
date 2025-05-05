// src/components/forum/publicationDetail/publicationDetail.tsx

'use client'

import { useEffect, useState } from 'react'
import Button from '@/components/buttonComponent/button'
import AvatarUser from '@/components/avatarUserComponent/avatarUser'
import AnswerCard from '@/components/forum/answerCard/answerCard'
import { ArrowDropUp, ArrowDropDown, ArrowBack } from '@mui/icons-material';
import { PublicationDetailResponse, AnswerResponse } from '@/lib/types/forum'
import { getQuillContent, initializeQuill } from '@/lib/utils/quill'
import { getPublicationTimeAgo } from '@/lib/helpers/timeHelper'
import styles from './publicationDetail.module.css'
import Editor from '@/components/editorComponent/editor'

interface PublicationDetailProps {
  publication: PublicationDetailResponse
  onBack: () => Promise<void>
  onAddAnswer: (answer: AnswerResponse) => Promise<void>
  onVotePublication: (isUpvote: boolean) => Promise<void>
}

export default function PublicationDetail({
  publication,
  onBack,
  onAddAnswer,
  onVotePublication
}: PublicationDetailProps) {

  const [editorContent, setEditorContent] = useState('<p>Inserte aquí su respuesta...</p>')

  // useEffect(() => {
  //   initializeQuill('editor')
  // }, [])

  const handleComment = async () => {
    const texto = await getQuillContent()
    const newAnswer: AnswerResponse = {
      codigoRespuesta: publication.respuestas.length === 0 ? 1 : publication.respuestas[publication.respuestas.length - 1].codigoRespuesta + 1,
      textoRespuesta: texto,
      votos: 0,
      fechaCreacion: new Date().toISOString(),
      respuestaCorrecta: false,
      usuario: publication.usuario,
      archivos: [],
    }
    onAddAnswer(newAnswer)
  }

  return (
    <div className={styles.forumDetailContainer}>
      <main style={{ width: '100%' }}>
        <div className='forum-left'>
          <Button
            onClick={onBack}
            icon={<ArrowBack />}
            circular
          />
          <div className={styles.publicationSection}>
            <div className={styles.commentSection}>
              <div className={styles.commentsWrp}>
                <div className={styles.commentWrp}>
                  <div className={`${styles.comment} ${styles.pubContainer}`}>
                  <div className={styles.cScore}>
                    <Button
                      width="45px"
                      text=""
                      onClick={() => onVotePublication(true)}
                      icon={<ArrowDropUp />}
                      circular={true}
                    />
                    <p className={styles.scoreNumber}>{publication.votos}</p>
                    <Button
                      width="45px"
                      text=""
                      onClick={() => onVotePublication(false)}
                      icon={<ArrowDropDown />}
                      circular={true}
                    />
                  </div>
                    <div className={styles.cControls}>
                      <a className={styles.edit}>
                        <img src="images/icon-edit.svg" alt="" className={styles.controlIcon}/>Edit
                      </a>
                      <a className={styles.reply}>
                        <img src="images/icon-reply.svg" alt="" className={styles.controlIcon}/>Reply
                      </a>
                    </div>
                    <div className={styles.cUser}>
                      <AvatarUser
                        imageUser={publication.usuario?.image}
                        tagUser={publication.usuario?.iniciales}
                        descripcionCorta={publication.usuario?.descripcionCorta}
                        descripcionLarga={publication.usuario?.descripcionLarga}
                        nombreCompleto={publication.usuario?.nombreCompleto}
                      />
                      <p className={styles.usrName}>{publication.usuario?.nombreCompleto}</p>
                      <p className={styles.cmntAt}>{getPublicationTimeAgo('Respondido', new Date(publication.fechaCreacion))}</p>
                    </div>
                    <p className={styles.cText}>
                      <span className={styles.cBody}>{publication.contenido}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className={`${styles.publicationReplyInputContainer} ${styles.pubContainer}`}>
                <div className={styles.publicationReplyInput}>
                  <div className={styles.responseContainer}>
                    <Editor onContentChange={(html) => setEditorContent(html)} />
                  </div>
                  <Button
                    text="Comentar"
                    onClick={handleComment}
                    width="100%"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className={styles.responsesSection}>
            <div className={styles.commentSection}>
              <div className={styles.commentsWrp}>
                {publication.respuestas.length === 0 ? (
                  <h3>¡Sé el primero en responder!</h3>
                ) : (
                  <h3>{publication.respuestas.length} Respuesta{publication.respuestas.length > 1 ? 's' : ''}</h3>
                )}

                {publication.respuestas.map((respuesta) => (
                  <AnswerCard 
                    key={respuesta.codigoRespuesta} 
                    answer={respuesta} 
                    onUpvote={async () => { console.log("Voté para arriba"); }} 
                    onDownvote={async () => { console.log("Voté para abajo"); }} 
                    onDelete={async () => { console.log("Respuesta eliminada"); }} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={`${styles.modalWrp} ${styles.invisible}`}>
          <div className={`${styles.modal} ${styles.pubContainer}`}>
            <h3>Delete comment</h3>
            <p>Are you sure you want to delete this comment? This will remove the comment and can't be undone.</p>
            <button className={styles.yes}>YES, DELETE</button>
            <button className={styles.no}>NO, CANCEL</button>
          </div>
        </div>

        <div className='forum-right'></div>
      </main>
    </div>
  )
}
