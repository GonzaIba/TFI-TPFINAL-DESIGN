// src/components/forum/publicationDetail/publicationDetail.tsx

'use client'

import { useEffect, useState, useCallback } from 'react'
import Button from '@/components/buttonComponent/button'
import AvatarUser from '@/components/avatarUserComponent/avatarUser'
import AnswerCard from '@/components/forum/answerCard/answerCard'
import { ArrowDropUp, ArrowDropDown, ArrowBack } from '@mui/icons-material';
import { 
  PublicationDetailResponse,
  AnswerResponse, 
  PublicationVoteRequest, 
  AnswerVoteRequest, 
  AnswerPublicationVoteResponse,
  AddAnswerRequest
} from '@/lib/types/forum'
import { publicationsService } from '@/lib/services/forum/publicationsService'
import { getPublicationTimeAgo } from '@/lib/helpers/timeHelper'
import styles from './publicationDetail.module.css'
import EditorInput from '@/components/editorComponent/editor'
import { Colors } from '@/theme/colors'
import { usePublicationSignalR } from '@/hooks';
import { VoteNumber } from '@/components/labelComponent/numberMotionComponent/numberMotion'


interface PublicationDetailProps {
  publication: PublicationDetailResponse
  onBack: () => Promise<void>
  onAddAnswer: (answer: AddAnswerRequest) => Promise<void>
}

export default function PublicationDetail({
  publication,
  onBack,
  onAddAnswer,
}: PublicationDetailProps) {

  const [editorContent, setEditorContent] = useState('<p>Inserte aquí su respuesta...</p>')
  const [loadingUpVote, setLoadingUpVote] = useState(false);
  const [loadingDownVote, setLoadingDownVote] = useState(false);
  const isVoting = loadingUpVote || loadingDownVote;
  const isPositiveVoted = publication.votedPositive;

  const [votes, setVotes] = useState(publication.votes);
  const [answers, setAnswers] = useState(publication.answers);

  const handleVotePublicationChanged = useCallback((newVotes: number) => {
    setVotes(newVotes);
  }, []);

  const handleVoteAnswerChanged = useCallback((answerId: number, newVotes: number) => {
    setAnswers(prevAnswers =>
      prevAnswers.map(answer =>
        answer.codeAnswer === answerId
          ? { ...answer, votes: newVotes }
          : answer
      )
    );
  }, []);

  const handleCommentAdded = useCallback((newComment: AnswerResponse) => {
  }, []);

  console.log('render publicationDetail');

  usePublicationSignalR({
    publicationId: publication.codePublication,
    onVotePublicationChanged: handleVotePublicationChanged,
    onVoteAnswerChanged: handleVoteAnswerChanged,
    onCommentAdded: handleCommentAdded,
  });

  const handleComment = async (textResponse: string) => {
    const newAnswer: AddAnswerRequest = {
      codePublication: publication.codePublication,
      textResponse: textResponse,
    }
    await onAddAnswer(newAnswer)
  }

  const handleOnClicUpVotePublication = async () => {
    setLoadingUpVote(true);
    try {
      let response = await votePublication(true);
      if(response.success) {
        publication.votedPositive = publication.votedPositive === true ? undefined : true;
      }
    } finally {
      setLoadingUpVote(false);
    }
  };

  const handleOnClicDownVotePublication = async () => {
    setLoadingDownVote(true);
    try {
      let response = await votePublication(false);
      if(response.success) {
        publication.votedPositive = publication.votedPositive === false ? undefined : false;
      }
    } finally {
      setLoadingDownVote(false);
    }
  };

  const handleOnClicUpVoteAnswer = async (answerCode: number) => {
    try {
      let response = await voteAnswer(true, answerCode);
      if(response.success) {
        setAnswers(prevAnswers =>
          prevAnswers.map(answer =>
            answer.codeAnswer === answerCode
              ? { ...answer, votedPositive: answer.votedPositive === true ? undefined : true }
              : answer)
        )
      }
    } catch (error) {
      console.error('Error al votar la respuesta:', error);
    }
  };

  const handleOnClicDownVoteAnswer = async (answerCode: number) => {
    try {
      let response = await voteAnswer(false, answerCode);
      if(response.success) {
        setAnswers(prevAnswers =>
          prevAnswers.map(answer =>
            answer.codeAnswer === answerCode
              ? { ...answer, votedPositive: answer.votedPositive === false ? undefined : false }
              : answer)
        )
      }
    } catch (error) {
      console.error('Error al votar la respuesta:', error);
    }
  };

  const votePublication = async (isPositive : boolean) => {
    let request: PublicationVoteRequest = {
      publicationCode: publication.codePublication,
      isPositive: isPositive,
    }
    const response = await publicationsService.votePublication(request);
    return response;
  }

  const voteAnswer = async (isPositive: boolean, answerCode: number) => {
    let request: AnswerVoteRequest = {
      publicationCode: publication.codePublication,
      answerCode: answerCode,
      isPositive: isPositive,
    }
    const response = await publicationsService.voteAnswer(request);
    return response;
  }

  const handleUpvoteFactory = useCallback((answerCode: number) => {
    return async () => {
      await handleOnClicUpVoteAnswer(answerCode);
    };
  }, []);

  const handleDownvoteFactory = useCallback((answerCode: number) => {
    return async () => {
      await handleOnClicDownVoteAnswer(answerCode);
    };
  }, []);

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
                      onClick={handleOnClicUpVotePublication}
                      icon={<ArrowDropUp sx={{ fontSize: 48, color: isPositiveVoted === true ? Colors.primary : Colors.white }} />}
                      circular={true}
                      loading={loadingUpVote}
                      disabled={isVoting}
                      transparent
                      tooltipOptions={{
                        title: 'Esta respuesta es útil (hacer clic de nuevo para deshacer la acción)',
                        placement: 'right',
                        width: 250,
                        transition: 'zoom',
                        arrow: true
                      }}
                    />
                    <VoteNumber value={votes} />
                    {/* <p className={styles.scoreNumber}>{votes}</p> */}
                    <Button
                      width="45px"
                      text=""
                      onClick={handleOnClicDownVotePublication}
                      icon={<ArrowDropDown sx={{ fontSize: 48, color: isPositiveVoted === false ? Colors.primary : Colors.white }} />}
                      circular={true}
                      loading={loadingDownVote}
                      disabled={isVoting}
                      transparent
                      tooltipOptions={{
                        title: 'Esta respuesta no es útil (hacer clic de nuevo para deshacer la acción)',
                        placement: 'right',
                        width: 250,
                        transition: 'zoom',
                        arrow: true
                      }}
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
                        imageUser={publication.user?.image}
                        tagUser={publication.user?.initials}
                        descripcionCorta={publication.user?.shortDescription}
                        descripcionLarga={publication.user?.longDescription}
                        nombreCompleto={publication.user?.completeName}
                      />
                      <p className={styles.usrName}>{publication.user?.completeName}</p>
                      <p className={styles.cmntAt}>{getPublicationTimeAgo('Respondido', new Date(publication.createdDate))}</p>
                    </div>
                    <p className={styles.cText}>
                      <span className={styles.cBody}>{publication.content}</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className={`${styles.publicationReplyInputContainer} ${styles.pubContainer}`}>
                <div className={styles.publicationReplyInput}>
                  <div className={styles.responseContainer}>
                    <EditorInput onComment={handleComment} />
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
                {publication.answers.length === 0 ? (
                  <h3>¡Sé el primero en responder!</h3>
                ) : (
                  <h3>{publication.answers.length} Respuesta{publication.answers.length > 1 ? 's' : ''}</h3>
                )}

                {answers.map((respuesta) => (
                  <AnswerCard
                    key={respuesta.codeAnswer} 
                    answer={respuesta} 
                    onUpvote={handleUpvoteFactory(respuesta.codeAnswer)} 
                    onDownvote={handleDownvoteFactory(respuesta.codeAnswer)} 
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
