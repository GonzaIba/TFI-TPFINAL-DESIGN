// src/components/forum/publicationDetail/publicationDetail.tsx

'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import Button from '@/components/buttonComponent/button'
import AvatarUser from '@/components/avatarUserComponent/avatarUser'
import AnswerCard from '@/components/forum/answerCard/answerCard'
import { ArrowDropUp, ArrowDropDown, ArrowBack } from '@mui/icons-material';
import { publicationsService } from '@/lib/services/forum/publicationsService'
import { getPublicationTimeAgo } from '@/lib/helpers/timeHelper'
import styles from './publicationDetail.module.css'
import EditorInput, { EditorInputHandle } from '@/components/editorComponent/editor';
import { Colors } from '@/theme/colors'
import { usePublicationSignalR } from '@/hooks';
import { VoteNumber } from '@/components/labelComponent/numberMotionComponent/numberMotion'
import { useErrorHandler } from '@/hooks/errors/useErrorHandler'
import { 
  PublicationDetailResponse,
  AnswerResponse, 
  PublicationVoteRequest, 
  AnswerVoteRequest, 
  AnswerPublicationVoteResponse,
  AddAnswerRequest
} from '@/lib/types/forum'
// import { motion } from "motion/react"

interface PublicationDetailProps {
  publication: PublicationDetailResponse
  scrollRef?: React.RefObject<HTMLDivElement>
  onBack: () => Promise<void>
}

function PublicationDetail({
  publication,
  scrollRef,
  onBack,
}: PublicationDetailProps) {

  const editorRef = useRef<EditorInputHandle>(null);
  const [loadingUpVote, setLoadingUpVote] = useState(false);
  const [loadingDownVote, setLoadingDownVote] = useState(false);
  const [votes, setVotes] = useState(publication.votes);
  const [answers, setAnswers] = useState(publication.answers);
  const [newAnswerId, setNewAnswerId] = useState<number | null>(null);
  const isVoting = loadingUpVote || loadingDownVote;
  const isPositiveVoted = publication.votedPositive;

  const handleError = useErrorHandler();
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

  const handleCommentAdded = useCallback((newComment: AnswerResponse) => {}, []);

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
    await handleOnAddAnswer(newAnswer)
  }

  const handleOnAddAnswer = async (request: AddAnswerRequest) => {
    try {
      const result = await publicationsService.addAnswer(request)

      if (result.errors?.errorsList?.length > 0) {
        handleError(result.errors.errorsList);
        return;
      }

      console.log('Respuesta agregada:', result)
      if (result.data) {
        // Actualizar la publicación actual con la nueva respuesta
        console.log('Respuesta agregada, enter iffff', result.data)
        setAnswers(prevAnswers => [...prevAnswers, result.data as AnswerResponse]);
        setNewAnswerId(result.data.codeAnswer);
      }
    } catch (error) {
      console.error('Error al agregar respuesta:', error)
    }
  }

  const handleOnClicUpVotePublication = async () => {
    setLoadingUpVote(true);
    try {
      let response = await votePublication(true);

      if (response.errors?.errorsList?.length > 0) {
        handleError(response.errors.errorsList);
        return;
      }

      if(response?.data?.success) {
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
      if (response.errors?.errorsList?.length > 0) {
        handleError(response.errors.errorsList);
        return;
      }

      if(response?.data?.success) {
        publication.votedPositive = publication.votedPositive === false ? undefined : false;
      }
    } finally {
      setLoadingDownVote(false);
    }
  };

  const handleOnClicUpVoteAnswer = async (answerCode: number) => {
    try {
      let response = await voteAnswer(true, answerCode);
      if (response.errors?.errorsList?.length > 0) {
        handleError(response.errors.errorsList);
        return;
      }

      if(response?.data?.success) {
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
      if (response.errors?.errorsList?.length > 0) {
        handleError(response.errors.errorsList);
        return;
      }

      if(response?.data?.success) {
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
      codePublication: publication.codePublication,
      isPositive: isPositive,
    }
    const response = await publicationsService.votePublication(request);
    return response;
  }

  const voteAnswer = async (isPositive: boolean, answerCode: number) => {
    let request: AnswerVoteRequest = {
      codePublication: publication.codePublication,
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

  const handleCommentClick = async () => {
    const content = editorRef.current?.getHtml() ?? '';
    await handleComment(content);
  };

  useEffect(() => {
    setAnswers(publication.answers);
  }, [publication.answers]);

  useEffect(() => {
    if (!newAnswerId || !scrollRef?.current) return;

    const el = scrollRef.current;
    const alreadyInDOM = !!document.body.contains(el);
    
    const scrollToEl = () => {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (alreadyInDOM) {
      scrollToEl();
    } else {
      const observer = new MutationObserver(() => {
        if (document.body.contains(el)) {
          scrollToEl();
          observer.disconnect();
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }
  }, [newAnswerId, answers]);


  return (
    <div className={styles.forumDetailContainer}>
      <main style={{ width: '100%' }}>
        <Button
          onClick={onBack}
          icon={<ArrowBack />}
          circular
        />
        <div className='forum-left'>
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
                    <EditorInput ref={editorRef} />
                  </div>
                  <Button
                    text="Comentar"
                    onClick={handleCommentClick}
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
                  <h3 style={{paddingBottom:'1rem'}}>{publication.answers.length} Respuesta{publication.answers.length > 1 ? 's' : ''}</h3>
                )}
                {answers.map((respuesta) => (
                  <div
                    key={respuesta.codeAnswer}
                    ref={respuesta.codeAnswer === newAnswerId ? scrollRef ?? undefined : undefined}
                  >
                    <AnswerCard
                      answer={respuesta}
                      onUpvote={handleUpvoteFactory(respuesta.codeAnswer)}
                      onDownvote={handleDownvoteFactory(respuesta.codeAnswer)}
                      onDelete={async () => { console.log("Respuesta eliminada"); }}
                      isNew={respuesta.codeAnswer === newAnswerId} // para aplicar estilo
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className='forum-right'></div>
      </main>
    </div>
  )
}

export default PublicationDetail