'use client'

import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import Button from '@/components/buttonComponent/button'
import AvatarUser from '@/components/avatarUserComponent/avatarUser'
import AnswerCard from '@/components/forum/answerCard/answerCard'
import { ArrowDropUp, ArrowDropDown, ArrowBack, DeleteOutline, ReportProblemOutlined } from '@mui/icons-material';
import { publicationsService } from '@/lib/services/forum/publicationsService'
import { getPublicationTimeAgo } from '@/lib/helpers/timeHelper'
import styles from './publicationDetail.module.css'
import EditorInput from '@/components/editorComponent/editor';
import { Colors } from '@/theme/colors'
import { usePublicationSignalR, useOpenForumUserDetail, useWindowWidth } from '@/hooks';
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
import useAuthStore from '@/store/slices/authStore/authStore';

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
   * Copia local de la publicaciÃ³n para poder mutarla sin tocar la prop.
   * Si el padre cambia de publicaciÃ³n (nuevo id), reemplazamos el estado.
  */
  const [publication, setPublication] = useState<PublicationDetailResponse | undefined>(publicationProp);
  const [loadingUpVote, setLoadingUpVote] = useState(false);
  const [loadingDownVote, setLoadingDownVote] = useState(false);
  const [showModalDelete, setShowModalDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [scrollToNewest, setScrollToNewest] = useState(false);
  const [showNewAnswerAlert, setShowNewAnswerAlert] = useState(false);
  const openForumUserDetail = useOpenForumUserDetail();
  const [newAnswerId, setNewAnswerId] = useState<number | null>(null);
  const [editorKey, setEditorKey] = useState<number>(0);
  const [editedAnswerId, setEditedAnswerId] = useState<number | null>(null);
  const newAnswerElRef = useRef<HTMLDivElement | null>(null);
  const isVoting = loadingUpVote || loadingDownVote;
  const isPositiveVoted = publication?.votedPositive;

  const [selectedAnswerToDelete, setSelectedAnswerToDelete] = useState<AnswerResponse | null>(null);
  const [isAdminDeletingAnswer, setIsAdminDeletingAnswer] = useState(false);
  const [deleteAnswerReason, setDeleteAnswerReason] = useState('');
  const [deleteAnswerPassword, setDeleteAnswerPassword] = useState('');
  const [deleteAnswerError, setDeleteAnswerError] = useState<string | null>(null);
  const roleName = useAuthStore((state) => state.role ?? state.user?.roleName ?? null);
  const isAdmin = useMemo(() => {
    if (!roleName) return false;
    return roleName.toLowerCase().includes('admin');
  }, [roleName]);
  const [showDeletePublicationModal, setShowDeletePublicationModal] = useState(false);
  const [deletePublicationReason, setDeletePublicationReason] = useState('');
  const [deletePublicationPassword, setDeletePublicationPassword] = useState('');
  const [deletePublicationError, setDeletePublicationError] = useState<string | null>(null);
  const [isDeletingPublication, setIsDeletingPublication] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetail, setReportDetail] = useState('');
  const [reportError, setReportError] = useState<string | null>(null);
  const [isReportingPublication, setIsReportingPublication] = useState(false);
  const width = useWindowWidth();
  const isMobile = width < 768;

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
                isAuthor: false, //Es false, porque esto se le notifica a los demÃ¡s usuarios NO al que los generÃ³
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
        // Actualizar la publicaciÃ³n actual con la nueva respuesta
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
    if (isAdminDeletingAnswer) {
      if (!deleteAnswerReason.trim() || !deleteAnswerPassword.trim()) {
        setDeleteAnswerError('CompletÃ¡ el motivo y tu contraseÃ±a de administrador para continuar.');
        return;
      }
    }

    try {
      setIsDeleting(true);
      let response = await deleteAnswer();
      if (response.errors?.errorsList?.length > 0) {
        handleError(response.errors.errorsList);
        return;
      }

      if(response?.data?.success) {

        useSnackBarStore.getState().showToast({
          message: 'Se eliminÃ³ la respuesta correctamente.',
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
      handleOnCancelDelete();
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
    setIsAdminDeletingAnswer(false);
    setDeleteAnswerReason('');
    setDeleteAnswerPassword('');
    setDeleteAnswerError(null);
  }

  const handleOpenDeletePublicationModal = useCallback(() => {
    setDeletePublicationReason('');
    setDeletePublicationPassword('');
    setDeletePublicationError(null);
    setShowDeletePublicationModal(true);
  }, []);

  const handleCloseDeletePublicationModal = useCallback(() => {
    if (isDeletingPublication) return;
    setShowDeletePublicationModal(false);
    setDeletePublicationReason('');
    setDeletePublicationPassword('');
    setDeletePublicationError(null);
  }, [isDeletingPublication]);

  const handleConfirmDeletePublication = useCallback(async () => {
    if (!publication) return;
    const reason = deletePublicationReason.trim();
    const password = deletePublicationPassword.trim();

    if (!reason || !password) {
      setDeletePublicationError('CompletÃ¡ el motivo y tu contraseÃ±a de administrador para continuar.');
      return;
    }

    setDeletePublicationError(null);
    setIsDeletingPublication(true);
    try {
      const response = await publicationsService.deletePublication({
        codePublication: publication.codePublication,
        reason,
        password,
      });

      if (response?.errors?.errorsList?.length) {
        setDeletePublicationError(response.errors.errorsList[0]?.message ?? 'No se pudo eliminar la publicaciÃ³n.');
        return;
      }

      if (!response?.data?.success) {
        setDeletePublicationError('No se pudo eliminar la publicaciÃ³n.');
        return;
      }

      useSnackBarStore.getState().showToast({
        message: 'La publicaciÃ³n se eliminÃ³ correctamente.',
        variant: 'success',
      });

      setShowDeletePublicationModal(false);
      setDeletePublicationReason('');
      setDeletePublicationPassword('');
      setPublication(undefined);
      await onBack();
    } catch (error) {
      console.error('Error al eliminar la publicaciÃ³n', error);
      setDeletePublicationError('OcurriÃ³ un error al intentar eliminar la publicaciÃ³n. ContactÃ¡ con un administrador.');
    } finally {
      setIsDeletingPublication(false);
    }
  }, [publication, deletePublicationReason, deletePublicationPassword, onBack]);

  const handleOpenReportModal = useCallback(() => {
    setReportReason('');
    setReportDetail('');
    setReportError(null);
    setShowReportModal(true);
  }, []);

  const handleCloseReportModal = useCallback(() => {
    if (isReportingPublication) return;
    setShowReportModal(false);
    setReportReason('');
    setReportDetail('');
    setReportError(null);
  }, [isReportingPublication]);

  const handleConfirmReportPublication = useCallback(async () => {
    if (!publication) return;
    const reason = reportReason.trim();
    const detail = reportDetail.trim();

    if (reason.length < 3 || detail.length < 10) {
      setReportError('Contanos el motivo y brindanos al menos 10 caracteres de detalle para continuar.');
      return;
    }

    setIsReportingPublication(true);
    setReportError(null);

    try {
      const response = await publicationsService.reportPublication({
        codePublication: publication.codePublication,
        reason,
        detail,
      });

      if (response?.errors?.errorsList?.length) {
        handleError(response.errors.errorsList);
        setReportError(response.errors.errorsList[0]?.message ?? 'No pudimos enviar la denuncia.');
        return;
      }

      if (!response?.data?.success) {
        setReportError('No pudimos enviar la denuncia.');
        return;
      }

      useSnackBarStore.getState().showToast({
        message: 'Recibimos tu denuncia. Gracias por ayudarnos a moderar.',
        variant: 'success',
      });

      setShowReportModal(false);
      setReportReason('');
      setReportDetail('');
    } catch (error) {
      console.error('Error al denunciar la publicaciÃ³n:', error);
      setReportError('No pudimos enviar la denuncia. Intentalo nuevamente en unos minutos.');
    } finally {
      setIsReportingPublication(false);
    }
  }, [publication, reportReason, reportDetail, handleError]);

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
      setScrollToNewest(false);          // âœ… resetea el flag
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
    // Si cambiÃ³ de publicaciÃ³n (nuevo cÃ³digo) refrescamos el estado interno.
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
      // a 50 px del fondo es â€œsuficienteâ€
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

  const renderRelatedPanel = () => (
    <PanelSection
      title="Publicaciones relacionadas"
      items={relatedPublications ?? []}
      loading={!relatedPublications}
      getKey={(pub) => `${pub.codePublication}-${pub.createdDate}`}
      renderLoading={
        (
          <>
            <SkeletonLine internal/>
          </>
        )
      }
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
  );

  const renderRef = useRef(0);
  renderRef.current++;
  console.log(`ðŸ” Render PublicationDetailCard #${renderRef.current}`);

  return (
    <>
    {showNewAnswerAlert && newAnswerId && (
      <div className="new-answer-alert">
        <p>Â¡Hay nuevas respuestas!</p>
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
                    <div className={styles.cControls}>
                      <Button
                        onClick={handleOpenReportModal}
                        icon={<ReportProblemOutlined sx={{ color: Colors.white }} />}
                        width="45px"
                        backgroundColor={Colors.primary}
                        ariaLabel="Denunciar publicación"
                        title="Denunciar publicación"
                        loading={isReportingPublication}
                        disabled={isReportingPublication}
                      />
                      {isAdmin && (
                        <Button
                          onClick={handleOpenDeletePublicationModal}
                          icon={<DeleteOutline sx={{ color: Colors.white }} />}
                          width="45px"
                          backgroundColor={Colors.danger}
                          ariaLabel="Eliminar publicación"
                          title="Eliminar publicación"
                          loading={isDeletingPublication}
                          disabled={isDeletingPublication}
                        />
                      )}
                    </div>
                    <div className={styles.cUser}>
                      <AvatarUser
                        imageUser={publication.user?.image}
                        onClick={() => openForumUserDetail(publication.user?.email)}
                        tagUser={publication.user?.initials}
                        descripcionCorta={publication.user?.shortDescription}
                        descripcionLarga={publication.user?.longDescription}
                        nombreCompleto={publication.user?.completeName}
                        direction='right'
                      />
                      <p className={styles.usrName}>{publication.user?.completeName}</p>
                      <p className={styles.cmntAt}>{getPublicationTimeAgo('Respondido', new Date(publication.createdDate))}</p>
                    </div>
                    <div className={styles.cText}>
                      {publication?.title && (
                        <span className={styles.publicationTitle}>{publication.title}</span>
                      )}
                      <span className={styles.cBody}>{publication.content}</span>
                    </div>
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

        {isMobile && (
          <div className={styles.relatedMobile}>
            {renderRelatedPanel()}
          </div>
        )}

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
                    <h3>Â¡SÃ© el primero en responder!</h3>
                  )}
                  <AnimatePresence initial={false}>
                    {(publication?.answers ?? []).map(answer => {
                      const canEditAnswer = isWithinLastHour(answer.createdDate) && answer.isAuthor;
                      const canDeleteAnswer = isAdmin || canEditAnswer;
                      return (
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
                          canDelete={canDeleteAnswer}
                          deleteAsAdmin={isAdmin && !canEditAnswer}
                          canEdit={canEditAnswer}
                          isNew={answer.codeAnswer === newAnswerId}
                          isEdited={answer.codeAnswer === editedAnswerId}
                          onUpvote={async () => await handleOnClicUpVoteAnswer(answer.codeAnswer)}
                          onDownvote={async () => await handleOnClicDownVoteAnswer(answer.codeAnswer)}
                          onDelete={async () => {
                            setSelectedAnswerToDelete(answer);
                            setIsAdminDeletingAnswer(isAdmin && !canEditAnswer);
                            setDeleteAnswerReason('');
                            setDeleteAnswerPassword('');
                            setDeleteAnswerError(null);
                            setShowModalDelete(true);
                          }}
                          onSaveEdit={async (newText, answerCode) => { await handleSaveEdit(newText, answerCode)}}
                        />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {!isMobile && (
        <div className='forum-right'>
          {renderRelatedPanel()}
        </div>
      )}

      <ModalComponent
        open={showModalDelete}
        onClose={handleOnCancelDelete}
        closeIcon
        title="Eliminar respuesta"
        styles={{width: '560px'}}
      >
        <div className={styles.forumDeleteAnswer}>
          <h2>Â¿EstÃ¡s seguro de eliminar esta respuesta?</h2>
          <p>Ten en cuenta que esta accion es irreversible.</p>
          {isAdminDeletingAnswer && (
            <>
              <div className={styles.deletePublicationModalField}>
                <label htmlFor="delete-answer-reason">Motivo de la eliminaciÃ³n</label>
                <textarea
                  id="delete-answer-reason"
                  value={deleteAnswerReason}
                  onChange={(event) => {
                    setDeleteAnswerReason(event.target.value);
                    setDeleteAnswerError(null);
                  }}
                  placeholder="DetallÃ¡ por quÃ© necesitÃ¡s eliminar esta respuesta"
                  disabled={isDeleting}
                />
              </div>
              <div className={styles.deletePublicationModalField}>
                <label htmlFor="delete-answer-password">ContraseÃ±a de administrador</label>
                <input
                  id="delete-answer-password"
                  type="password"
                  value={deleteAnswerPassword}
                  onChange={(event) => {
                    setDeleteAnswerPassword(event.target.value);
                    setDeleteAnswerError(null);
                  }}
                  placeholder="IngresÃ¡ tu contraseÃ±a para confirmar"
                  disabled={isDeleting}
                />
              </div>
              {deleteAnswerError && (
                <div className={styles.deletePublicationModalError}>{deleteAnswerError}</div>
              )}
            </>
          )}
          <div className={styles.deletePublicationModalActions}>
            <Button
              text="Cancelar"
              onClick={handleOnCancelDelete}
              transparent
              backgroundColor={Colors.primary}
              disabled={isDeleting}
            />
            <Button
              text="Eliminar respuesta"
              onClick={async () => await handleOnClicDeleteAnswer()}
              backgroundColor={Colors.danger}
              loading={isDeleting}
              disabled={isDeleting}
            />
          </div>
        </div>
      </ModalComponent>

      <ModalComponent
        open={showDeletePublicationModal}
        onClose={handleCloseDeletePublicationModal}
        closeIcon
        title="Eliminar publicaciÃ³n"
        styles={{ width: '560px' }}
      >
        <div className={styles.deletePublicationModal}>
          <p>
            {publication
              ? `EstÃ¡s por eliminar la publicaciÃ³n "${publication.title}". Esta acciÃ³n es permanente y no se puede deshacer.`
              : 'EstÃ¡s por eliminar una publicaciÃ³n. Esta acciÃ³n es permanente y no se puede deshacer.'}
          </p>

          <div className={styles.deletePublicationModalField}>
            <label htmlFor="delete-publication-reason">Motivo de la eliminaciÃ³n</label>
            <textarea
              id="delete-publication-reason"
              value={deletePublicationReason}
              onChange={(event) => {
                setDeletePublicationReason(event.target.value);
                setDeletePublicationError(null);
              }}
              placeholder="DetallÃ¡ por quÃ© necesitÃ¡s eliminar esta publicaciÃ³n"
              disabled={isDeletingPublication}
            />
          </div>

          <div className={styles.deletePublicationModalField}>
            <label htmlFor="delete-publication-password">ContraseÃ±a de administrador</label>
            <input
              id="delete-publication-password"
              type="password"
              value={deletePublicationPassword}
              onChange={(event) => {
                setDeletePublicationPassword(event.target.value);
                setDeletePublicationError(null);
              }}
              placeholder="IngresÃ¡ tu contraseÃ±a para confirmar"
              disabled={isDeletingPublication}
            />
          </div>

          {deletePublicationError && (
            <div className={styles.deletePublicationModalError}>{deletePublicationError}</div>
          )}

          <div className={styles.deletePublicationModalActions}>
            <Button
              text="Cancelar"
              onClick={handleCloseDeletePublicationModal}
              transparent
              backgroundColor={Colors.primary}
              disabled={isDeletingPublication}
            />
            <Button
              text="Eliminar publicaciÃ³n"
              onClick={handleConfirmDeletePublication}
              backgroundColor={Colors.danger}
              loading={isDeletingPublication}
              disabled={isDeletingPublication}
            />
          </div>
        </div>
      </ModalComponent>
      <ModalComponent
        open={showReportModal}
        onClose={handleCloseReportModal}
        closeIcon
        title="Denunciar publicación"
        styles={{ width: '560px' }}
      >
        <div className={styles.deletePublicationModal}>
          <p>
            Contanos por qué creés que esta publicación incumple las reglas. Nuestro equipo la revisará a la brevedad.
          </p>
          <div className={styles.deletePublicationModalField}>
            <label htmlFor="report-publication-reason">Motivo</label>
            <input
              id="report-publication-reason"
              type="text"
              value={reportReason}
              onChange={(event) => {
                setReportReason(event.target.value);
                setReportError(null);
              }}
              placeholder="Ej. Contenido ofensivo, spam, información falsa..."
              disabled={isReportingPublication}
            />
          </div>
          <div className={styles.deletePublicationModalField}>
            <label htmlFor="report-publication-detail">Detalle</label>
            <textarea
              id="report-publication-detail"
              value={reportDetail}
              onChange={(event) => {
                setReportDetail(event.target.value);
                setReportError(null);
              }}
              placeholder="Brindanos más contexto para que podamos revisar el caso."
              disabled={isReportingPublication}
            />
          </div>
          {reportError && (
            <div className={styles.deletePublicationModalError}>{reportError}</div>
          )}
          <div className={styles.deletePublicationModalActions}>
            <Button
              text="Cancelar"
              onClick={handleCloseReportModal}
              transparent
              backgroundColor={Colors.primary}
              disabled={isReportingPublication}
            />
            <Button
              text="Enviar denuncia"
              onClick={handleConfirmReportPublication}
              backgroundColor={Colors.primary}
              loading={isReportingPublication}
              disabled={isReportingPublication}
            />
          </div>
        </div>
      </ModalComponent>
    </div>
    </>
  )
}

export default PublicationDetail
