// src/components/forum/publicationDetail/publicationDetail.tsx

'use client'

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import Button from '@/components/buttonComponent/button'
import AvatarUser from '@/components/avatarUserComponent/avatarUser'
import AnswerCard from '@/components/forum/answerCard/answerCard'
import { ArrowDropUp, ArrowDropDown, ArrowBack } from '@mui/icons-material';
import { publicationsService } from '@/lib/services/forum/publicationsService'
import { getPublicationTimeAgo } from '@/lib/helpers/timeHelper'
import styles from './publicationDetail.module.css'
import EditorInput from '@/components/editorComponent/editor';
import { Colors } from '@/theme/colors'
import { usePublicationSignalR } from '@/hooks';
import { VoteNumber } from '@/components/labelComponent/numberMotionComponent/numberMotion'
import { useErrorHandler } from '@/hooks/errors/useErrorHandler'
import { SkeletonAnswerCard, SkeletonEditorComment } from '@/components'
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
  publication?: PublicationDetailResponse
  scrollRef?: React.RefObject<HTMLDivElement>
  onBack: () => Promise<void>
}

function PublicationDetail({
  publication,
  scrollRef,
  onBack,
}: PublicationDetailProps) {

  const [loadingUpVote, setLoadingUpVote] = useState(false);
  const [loadingDownVote, setLoadingDownVote] = useState(false);
  const [votes, setVotes] = useState(publication?.votes);
  const [answers, setAnswers] = useState(publication?.answers);
  const [newAnswerId, setNewAnswerId] = useState<number | null>(null);
  const isVoting = loadingUpVote || loadingDownVote;
  const isPositiveVoted = publication?.votedPositive;

  const handleError = useErrorHandler();
  const handleVotePublicationChanged = useCallback((newVotes: number) => {
    setVotes(newVotes);
  }, []);

  const handleVoteAnswerChanged = useCallback((answerId: number, newVotes: number) => {
    setAnswers(prevAnswers =>
      (prevAnswers ?? []).map(answer =>
        answer.codeAnswer === answerId
          ? { ...answer, votes: newVotes }
          : answer
      )
    );
  }, []);

  const handleCommentAdded = useCallback((newComment: AnswerResponse) => {}, []);

  // console.log('render publicationDetail');

  usePublicationSignalR(publication ? {
    publicationId: publication.codePublication,
    onVotePublicationChanged: handleVotePublicationChanged,
    onVoteAnswerChanged: handleVoteAnswerChanged,
    onCommentAdded: handleCommentAdded,
  } : null);

  const handleComment = useCallback((text: string) => {
    if (!publication) return;
    const newAnswer: AddAnswerRequest = {
      codePublication: publication.codePublication,
      textResponse: text,
    };
    handleOnAddAnswer(newAnswer);
  }, [publication]);


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
        setAnswers(prevAnswers => [...(prevAnswers ?? []), result.data as AnswerResponse]);
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

      if(response?.data?.success && publication) {
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

      if(response?.data?.success && publication) {
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
          (prevAnswers ?? []).map(answer =>
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
          (prevAnswers ?? []).map(answer =>
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
    if (!publication) {
      throw new Error("Publication is undefined");
    }
    let request: PublicationVoteRequest = {
      codePublication: publication.codePublication,
      isPositive: isPositive,
    }
    const response = await publicationsService.votePublication(request);
    return response;
  }

  const voteAnswer = async (isPositive: boolean, answerCode: number) => {
    if (!publication) {
      throw new Error("Publication is undefined");
    }
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

  useEffect(() => {
    setAnswers(publication?.answers);
  }, [publication?.answers]);

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

  // useEffect(() => {
  //   console.log("🔍 Cambio en publicación:", publication);
  // }, [publication]);

  const renderRef = useRef(0);
  renderRef.current++;
  console.log(`🔁 Render PublicationDetailCard #${renderRef.current}`);

  useEffect(() => {
    console.log('🧩 Prop publication', publication);
  }, [publication]);



  return (
    <div className={styles.forumDetailContainer}>
      <div className='forum-left'>
        <div className={styles.publicationSection}>
          <Button onClick={onBack} icon={<ArrowBack />} circular />

          {publication ? (
            <div className={styles.commentSection}>
              <div className={styles.commentsWrp}>
                <div className={styles.commentWrp}>
                  <div className={`${styles.comment} ${styles.pubContainer}`}>
                    <div className={styles.cScore}>
                      <Button
                        width='45px'
                        text=''
                        onClick={handleOnClicUpVotePublication}
                        icon={<ArrowDropUp sx={{ fontSize: 48, color: isPositiveVoted === true ? Colors.primary : Colors.white }} />}
                        circular
                        loading={loadingUpVote}
                        disabled={isVoting}
                        transparent
                      />
                      <VoteNumber value={votes ?? 0} />
                      <Button
                        width='45px'
                        text=''
                        onClick={handleOnClicDownVotePublication}
                        icon={<ArrowDropDown sx={{ fontSize: 48, color: isPositiveVoted === false ? Colors.primary : Colors.white }} />}
                        circular
                        loading={loadingDownVote}
                        disabled={isVoting}
                        transparent
                      />
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
                    <p className={styles.cText}><span className={styles.cBody}>{publication.content}</span></p>
                  </div>
                </div>
              </div>
              <div className={`${styles.publicationReplyInputContainer} ${styles.pubContainer}`}>
                <div className={styles.publicationReplyInput}>
                  <div className={styles.responseContainer}>
                    <EditorInput onComment={handleComment} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.skeletonPublication}>
              <SkeletonAnswerCard />
              <SkeletonEditorComment />
            </div>
          )}
        </div>

        <div className={styles.responsesSection}>
          <div className={styles.commentSection}>
            <div className={styles.commentsWrp}>
              {!publication ? (
                <SkeletonAnswerCard />
              ) : publication?.answers?.length === 0 ? (
                <h3>¡Sé el primero en responder!</h3>
              ) : (
                <>
                  <h3>{publication?.answers?.length} Respuesta{publication?.answers?.length > 1 ? 's' : ''}</h3>
                  {(answers ?? []).map(respuesta => (
                    <div
                      key={respuesta.codeAnswer}
                      ref={respuesta.codeAnswer === newAnswerId ? scrollRef ?? undefined : undefined}
                    >
                      <AnswerCard
                        answer={respuesta}
                        onUpvote={async () => { await voteAnswer(true, respuesta.codeAnswer); }}
                        onDownvote={async () => { await voteAnswer(false, respuesta.codeAnswer); }}
                        onDelete={async () => console.log("Respuesta eliminada")}
                        isNew={respuesta.codeAnswer === newAnswerId}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='forum-right'>
        {/* Cualquier contenido a la derecha */}
      </div>
    </div>
  )
}

export default PublicationDetail