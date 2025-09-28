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
import { SkeletonAnswerCard, SkeletonEditorComment, ModalComponent, PanelSection, SkeletonLine } from '@/components'
import {
  PublicationDetailResponse,
  AnswerResponse, 
  PublicationVoteRequest, 
  AnswerVoteRequest, 
  AnswerPublicationVoteResponse,
  AddAnswerRequest,
  DeleteAnswerRequest,
  PublicationResponse
} from '@/lib/types/forum'
import { EditAnswerEvent } from '@/lib/types/events'
import { isWithinLastHour } from '@/lib/helpers/timeHelper';
import useSnackBarStore from '@/store/slices/snackBarStore/snackbarStore';
import { AddAnswerEvent } from '@/lib/types/events'
import { AnimatePresence, motion } from 'framer-motion';

interface PublicationDetailProps {
  publication?: PublicationDetailResponse;
  relatedPublications?: PublicationResponse[];
  onClicRelatedPub: (codNumber: number) => Promise<void>
  scrollRef?: React.RefObject<HTMLDivElement>
  onBack: () => Promise<void>
}

function PublicationDetail({
  publication: publicationProp,
  relatedPublications,
  onClicRelatedPub,
  scrollRef,
  onBack,
}: PublicationDetailProps) {

  /*
   * Copia local de la publicación para poder mutarla sin tocar la prop.
   * Si el padre cambia de publicación (nuevo id), reemplazamos el estado.
  */
  const [publication, setPublication] = useState<PublicationDetailResponse | undefined>(publicationProp);
  const [loadingUpVote, setLoadingUpVote] = useState(false);
  const [loadingDownVote, setLoadingDownVote] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [scrollToNewest, setScrollToNewest] = useState(false);
  const [showNewAnswerAlert, setShowNewAnswerAlert] = useState(false);
  const [newAnswerId, setNewAnswerId] = useState<number | null>(null);
  const [editorKey, setEditorKey] = useState<number>(0);
  const [editedAnswerId, setEditedAnswerId] = useState<number | null>(null);
  const newAnswerElRef = useRef<HTMLDivElement | null>(null);
  const isVoting = loadingUpVote || loadingDownVote;
  const isPositiveVoted = publication?.votedPositive;

  const [selectedAnswerToDelete, setSelectedAnswerToDelete] = useState<AnswerResponse | null>(null);

  const handleError = useErrorHandler();
  const handleVotePublicationChanged = useCallback((newVotes: number) => {
    setPublication(p =>
      p ? { ...p, votes: newVotes } : p,
    );
  }, []);

  const handleVoteAnswerChanged = useCallback((codeAnswer: number, newVotes: number) => {
    setPublication(p =>
      p
        ? {
            ...p,
            answers: p.answers.map(a =>
              a.codeAnswer === codeAnswer ? { ...a, votes: newVotes } : a,
            ),
          }
        : p,
    );
  }, []);

  const handleCommentAdded = useCallback((newComment: AddAnswerEvent) => {
    setPublication(p =>
      p
        ? {
            ...p,
            answers: [
              ...p.answers,
              {
                codeAnswer: newComment.codeAnswer,
                votes: newComment.votes,
                user: newComment.user,
                textResponse: newComment.textResponse,
                createdDate: newComment.createdDate,
                correctAnswer: newComment.correctAnswer,
                isAuthor: false, //Es false, porque esto se le notifica a los demás usuarios NO al que los generó
                votedPositive: newComment.votedPositive,
                files: newComment.files ?? [],
              }
            ]
          }
        : p,
    );

    setNewAnswerId(newComment.codeAnswer);
    setScrollToNewest(false);
    setShowNewAnswerAlert(true);
  }, []);

  const handleCommentDeleted = useCallback((codeAnswer: number) => {
    setPublication(p =>
      p
        ? {
            ...p,
            answers: p.answers.filter(a => a.codeAnswer !== codeAnswer),
          }
        : p,
    );
  }, []);

  const handleCommentEdited = useCallback((editEvent: EditAnswerEvent) => {
    const codeAnswer = (editEvent as any)?.answerCode ?? (editEvent as any)?.codeAnswer;
    const newText = (editEvent as any)?.content ?? (editEvent as any)?.textResponse ?? (editEvent as any)?.contenido ?? (editEvent as any)?.newText;
    if (codeAnswer == null || typeof newText !== 'string') return;
    setPublication(p =>
      p
        ? {
            ...p,
            answers: p.answers.map(a =>
              a.codeAnswer === codeAnswer ? { ...a, textResponse: newText } : a,
            ),
          }
        : p,
    );
    setEditedAnswerId(codeAnswer);
  }, []);

  const connectionId = usePublicationSignalR(
    publication
      ? {
          publicationId: publication.codePublication,
          onVotePublicationChanged: handleVotePublicationChanged,
          onVoteAnswerChanged: handleVoteAnswerChanged,
          onCommentAdded: handleCommentAdded,
          onCommentDeleted: handleCommentDeleted,
          onCommentEdited: handleCommentEdited
        }
      : null
  );

  useEffect(() => {
    if (!editedAnswerId) return;
    const t = setTimeout(() => setEditedAnswerId(null), 1800);
    return () => clearTimeout(t);
  }, [editedAnswerId]);

  const handleOnAddAnswer = async (text: string) => {
    try {
      if (!publication) {
        throw new Error("Publication is undefined");
      }
      const newAnswer: AddAnswerRequest = {
        codePublication: publication.codePublication,
        textResponse: text,
        connectionId: connectionId
      };
      const result = await publicationsService.addAnswer(newAnswer)

      if (result.errors?.errorsList?.length > 0) {
        handleError(result.errors.errorsList);
        return;
      }

      console.log('Respuesta agregada:', result)
      if (result.data) {
        // Actualizar la publicación actual con la nueva respuesta
        console.log('Respuesta agregada, enter iffff', result.data)
        setPublication(p =>
          p
            ? { ...p, answers: [...p.answers, result.data as AnswerResponse] }
            : p,
        );
        setNewAnswerId(result.data.codeAnswer);
        setScrollToNewest(true);
        setShowNewAnswerAlert(false);
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
        setPublication(p =>
          p
            ? {
                ...p,
                votedPositive: p.votedPositive === true ? undefined : true,
                votes: p.votedPositive === true ? p.votes - 1 : p.votes + 1
              }
            : p,
        );
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
        setPublication(p =>
          p
            ? {
                ...p,
                votedPositive: p.votedPositive === false ? undefined : false,
                votes: p.votedPositive === false ? p.votes + 1 : p.votes - 1
              }
            : p,
        );
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
        setPublication(p =>
          p
            ? {
                ...p,
                answers: p.answers.map(a =>
                  a.codeAnswer === answerCode
                    ? { 
                        ...a, 
                        votedPositive: a.votedPositive === true ? undefined : true, 
                        votes: a.votedPositive === true ? a.votes - 1 : a.votes + 1 
                      }
                    : a,
                ),
              }
            : p,
        );
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
        setPublication(p =>
          p
            ? {
                ...p,
                answers: p.answers.map(a =>
                  a.codeAnswer === answerCode
                    ? { 
                        ...a, 
                        votedPositive: a.votedPositive === false ? undefined : false,
                        votes: a.votedPositive === false ? a.votes + 1 : a.votes - 1 
                      }
                    : a,
                ),
              }
            : p,
        );
      }
    } catch (error) {
      console.error('Error al votar la respuesta:', error);
    }
  };

  const handleOnClicDeleteAnswer = async () => {
    try {
      setIsDeleting(true);
      let response = await deleteAnswer();
      if (response.errors?.errorsList?.length > 0) {
        handleError(response.errors.errorsList);
        return;
      }

      if(response?.data?.success) {

        useSnackBarStore.getState().showToast({
          message: 'Se eliminó la respuesta correctamente.',
          variant: 'success',
        });

        setPublication(p =>
          p
            ? {
                ...p,
                answers: p.answers.filter(a => a.codeAnswer !== selectedAnswerToDelete?.codeAnswer),
              }
            : p,
        );
      }
    } catch (error) {
      console.error('Error al votar la respuesta:', error);
    } finally {
      setIsDeleting(false);
      setShowModalDelete(false);
      setSelectedAnswerToDelete(null);
    }
  };

  const handleSaveEdit = async (text: string, answerCode: number) => {
    if (!publication || answerCode === null) return;
    // suponiendo que tu API exponga editAnswer:
    await publicationsService.editAnswer({
      codePublication: publication.codePublication,
      answerCode: answerCode,
      contenido: text,
      connectionId
    });
    // refresca el estado con el nuevo texto
    setPublication(p =>
      p
        ? {
            ...p,
            answers: p.answers.map(a =>
              a.codeAnswer === answerCode
                ? { ...a, textResponse: text }
                : a
            ),
          }
        : p
    );
  };

  const handleOnCancelDelete = () => {
    setShowModalDelete(false);
    setSelectedAnswerToDelete(null);
  }

  const votePublication = async (isPositive : boolean) => {
    if (!publication) {
      throw new Error("Publication is undefined");
    }
    let request: PublicationVoteRequest = {
      codePublication: publication.codePublication,
      isPositive: isPositive,
      connectionId: connectionId
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
      connectionId: connectionId
    }
    const response = await publicationsService.voteAnswer(request);
    return response;
  }

  const deleteAnswer = async () => {
    if (!publication || !selectedAnswerToDelete) {
      throw new Error("Publication is undefined");
    }
    const request: DeleteAnswerRequest = {
      codePublication: publication.codePublication,
      answerCode: selectedAnswerToDelete.codeAnswer,
      connectionId: connectionId
    };
    const response = await publicationsService.deleteMyAnswer(request);
    return response;
  }

  useEffect(() => {
    if (!scrollToNewest || !newAnswerId || !scrollRef?.current) return;

    const el = scrollRef.current;

    const scrollToEl = () =>
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (document.body.contains(el)) {
      scrollToEl();
      setScrollToNewest(false);          // ✅ resetea el flag
    } else {
      const obs = new MutationObserver(() => {
        if (document.body.contains(el)) {
          scrollToEl();
          setScrollToNewest(false);
          obs.disconnect();
        }
      });
      obs.observe(document.body, { childList: true, subtree: true });
      return () => obs.disconnect();
    }
  }, [newAnswerId, publication?.answers?.length, scrollToNewest]);

  useEffect(() => {
    // Si cambió de publicación (nuevo código) refrescamos el estado interno.
    if (publicationProp?.codePublication !== publication?.codePublication) {
      setPublication(publicationProp);
      setEditorKey(prev => prev + 1);
    }
  }, [publicationProp]);

  const handleOnClickScrollDown = () => {
    setShowNewAnswerAlert(false);
    if (scrollRef?.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const onScroll = () => {
      if (!showNewAnswerAlert || !scrollRef?.current) return;

      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      // a 50 px del fondo es “suficiente”
      if (scrollHeight - scrollTop - clientHeight < 50) {
        setShowNewAnswerAlert(false);
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [showNewAnswerAlert]);

  useEffect(() => {
    if (!showNewAnswerAlert || !newAnswerElRef.current) return;

    const el = newAnswerElRef.current;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowNewAnswerAlert(false);  // oculta la alerta
          io.disconnect();
        }
      },
      { threshold: 0.4 }  // 40 % visible basta; ajusta si quieres
    );

    io.observe(el);
    return () => io.disconnect();
  }, [showNewAnswerAlert, newAnswerId]);

  const renderRef = useRef(0);
  renderRef.current++;
  console.log(`🔁 Render PublicationDetailCard #${renderRef.current}`);

  return (
    <>
    {showNewAnswerAlert && newAnswerId && (
      <div className="new-answer-alert">
        <p>¡Hay nuevas respuestas!</p>
        <Button onClick={handleOnClickScrollDown} icon={<ArrowBack />} circular />
      </div>
    )}
    <div className={styles.buttonBack}>
      <Button onClick={onBack} icon={<ArrowBack />} circular />
    </div>
    <div className={styles.forumDetailContainer}>
      <div className='forum-left'>
        <div className={styles.publicationSection}>

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
                      <VoteNumber value={publication?.votes ?? 0} />
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
                        direction='right'
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
                    <EditorInput key={editorKey} onComment={handleOnAddAnswer} />
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
              ) : (
                <>
                  {publication?.answers?.length > 0 ? (
                    <h3 className={styles.answersTitle}>{publication?.answers?.length} Respuesta{publication?.answers?.length > 1 ? 's' : ''}</h3>
                  ) : (
                    <h3>¡Sé el primero en responder!</h3>
                  )}
                  <AnimatePresence initial={false}>
                    {(publication?.answers ?? []).map(answer => (
                      <motion.div
                        key={answer.codeAnswer}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className={styles.answerWrapper}
                        ref={node => {
                          if (answer.codeAnswer === newAnswerId && node) {
                            scrollRef!.current = node;
                            newAnswerElRef.current = node;
                          }
                        }}
                      >
                        <AnswerCard
                          answer={answer}
                          canDelete={isWithinLastHour(answer.createdDate) && answer.isAuthor}
                          canEdit={isWithinLastHour(answer.createdDate) && answer.isAuthor}
                          isNew={answer.codeAnswer === newAnswerId}
                          isEdited={answer.codeAnswer === editedAnswerId}
                          onUpvote={async () => await handleOnClicUpVoteAnswer(answer.codeAnswer)}
                          onDownvote={async () => await handleOnClicDownVoteAnswer(answer.codeAnswer)}
                          onDelete={async () => {
                            setSelectedAnswerToDelete(answer);
                            setShowModalDelete(true);
                          }}
                          onSaveEdit={async (newText, answerCode) => { await handleSaveEdit(newText, answerCode)}}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='forum-right'>
        <PanelSection
          title="Publicaciones relacionadas"
          items={relatedPublications ?? []}
          loading={!relatedPublications}
          getKey={(pub) => `${pub.codePublication}-${pub.createdDate}`}
          renderLoading={(
            <>
              <SkeletonLine internal/>
            </>
          )}
          renderItem={(pub, i) => (
            <div
              className={styles.relatedPub}
              title={pub.title}
              onClick={async()=> {onClicRelatedPub(pub.codePublication)}}
            >
              {pub.title}
            </div>
          )}
          emptyMessage={
            <p>
              No se encontraron publicaciones relacionadas.
            </p>
          }
        />
      </div>

      <ModalComponent open={showModalDelete} onClose={() => setShowModalDelete(false)} styles={{width: '500px'}}>
        <div className={styles.forumDeleteAnswer}>
          <h2>¿Estás seguro de eliminar esta respuesta?</h2>
          <p>Ten en cuenta que esta accion es irreversible.</p>
          <div className='buttonList'>
            <Button
              onClick={async () => await handleOnClicDeleteAnswer()}
              text="Eliminar"
              loading={isDeleting}
            />
            <Button
              onClick={handleOnCancelDelete}
              text="Cancelar"
            />
          </div>
        </div>
      </ModalComponent>
    </div>
    </>
  )
}

export default PublicationDetail
