'use client';

import { useState, useEffect } from 'react';
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { CheckCircle } from 'lucide-react';
import AvatarUser from '@/components/avatarUserComponent/avatarUser';
import { useOpenForumUserDetail } from '@/hooks';
import Button from '@/components/buttonComponent/button';
import { AnswerResponse } from '@/lib/types/forum';
import styles from '../publicationDetail/publicationDetail.module.css';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Colors } from '@/theme/colors';
import { VoteNumber, SkeletonEditorComment } from '@/components';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-image-crop/dist/ReactCrop.css';
import 'reactjs-tiptap-editor/style.css';

import 'prism-code-editor-lightweight/layout.css'; 
import 'prism-code-editor-lightweight/themes/github-dark.css'; 

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Hoist dynamic import to module scope to avoid remounts on each keystroke
const EditorInput = dynamic(
  () => import('@/components/editorComponent/editor'),
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: 16 }}>
        <SkeletonEditorComment isInEditorComponent />
      </div>
    )
  }
)

interface Props {
  answer: AnswerResponse;
  canDelete: boolean;
  canEdit: boolean;
  isNew?: boolean;
  isEdited?: boolean;
  onUpvote: () => Promise<void>;
  onDownvote: () => Promise<void>;
  onDelete: () => Promise<void>;
  onSaveEdit?: (newText: string, answerCode: number) => Promise<void>;
}

export default function AnswerCard({ 
  answer,
  canDelete,
  canEdit,
  isNew = false,
  isEdited = false,
  onUpvote, 
  onDownvote, /*  */
  onDelete,
  onSaveEdit
}: Props) {

  const [loadingUpVote, setLoadingUpVote] = useState(false);
  const [loadingDownVote, setLoadingDownVote] = useState(false);
  const [animateNew, setAnimateNew] = useState(false);
  const [flashEdited, setFlashEdited] = useState(false);
  /** Nuevos estados para inline edit */
  const [isEditing, setIsEditing] = useState(false);
  // contenido actual mientras se edita (no se reinyecta al editor para evitar resets)
  const [editedContent, setEditedContent] = useState<string | null>(null);
  const isVoting = loadingUpVote || loadingDownVote;
  const isPositiveVoted = answer.votedPositive;
  const openForumUserDetail = useOpenForumUserDetail();

  const handleOnUpVote = async () => {
    setLoadingUpVote(true);
    await onUpvote();
    setLoadingUpVote(false);
  }

  const handleOnDownVote = async () => {
    setLoadingDownVote(true);
    await onDownvote();
    setLoadingDownVote(false);
  }

  const startEdit = () => {
    setEditedContent(answer.textResponse);
    setIsEditing(true);
  };
  const cancelEdit = () => setIsEditing(false);
  const saveEdit = async () => {
    if (onSaveEdit) {
      await onSaveEdit(editedContent ?? answer.textResponse, answer.codeAnswer);
      setIsEditing(false);
    }
  };

  // cargamos el editor **solo** cuando isEditing===true
  // Pre-carga opcional del editor para evitar trabas al abrir
  useEffect(() => {
    if (!canEdit) return;
    const id = setTimeout(() => {
      import('@/components/editorComponent/editor').catch(() => {});
    }, 0);
    return () => clearTimeout(id);
  }, [canEdit]);

  useEffect(() => {
    if (isNew) {
      // Espera un frame para montar con animación
      requestAnimationFrame(() => {
        setAnimateNew(true);
      });
    }
  }, [isNew]);

  // Pequeño destello cuando llega un edit por SignalR (para otros usuarios)
  useEffect(() => {
    if (!isEdited) return;
    setFlashEdited(true);
    const t = setTimeout(() => setFlashEdited(false), 1600);
    return () => clearTimeout(t);
  }, [isEdited]);
  
  return (
    <motion.div
      initial={isNew ? { opacity: 0, scale: 0.95, boxShadow: '0 0 0px rgba(0, 195, 255, 0)' } : undefined}
      animate={
        animateNew
          ? 
            {
              opacity: 1,
              scale: 1,
              boxShadow: [
                '0 0 0px rgba(0, 195, 255, 0)',
                '0 0 15px rgba(0, 195, 255, 0.5)',
                '0 0 25px rgba(0, 195, 255, 0.8)',
                '0 0 0px rgba(0, 195, 255, 0)',
              ],
            }
          : flashEdited
            ? {
                boxShadow: [
                  '0 0 0px rgba(255, 200, 0, 0)',
                  '0 0 14px rgba(255, 200, 0, 0.6)',
                  '0 0 0px rgba(255, 200, 0, 0)',
                ],
              }
            : undefined
      }
      transition={
        animateNew
          ? {
              duration: 1.2,
              ease: 'easeOut',
              boxShadow: {
                duration: 2.5,
                ease: 'easeInOut',
              },
            }
          : flashEdited
            ? {
                boxShadow: { duration: 1.2, ease: 'easeInOut' },
              }
            : undefined
      }
      className={styles.answerCardAnimated}
    >
      {flashEdited && (
        <motion.div
          className={styles.editedBadge}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          Editado
        </motion.div>
      )}
      <div className={styles.commentWrp}>
        <div className={`${styles.comment} ${styles.pubContainer}`}>
          <div className={styles.cScore}>
            <Button
              width="45px"
              text=""
              onClick={handleOnUpVote}
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
            <VoteNumber value={answer.votes} />       
            {answer.correctAnswer && ( <CheckCircle className="text-green-500" size={34} />)}
            <Button
              width="45px"
              text=""
              onClick={handleOnDownVote}
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
            {canEdit && (
              <Button
                onClick={startEdit}
                icon={<EditIcon />}
                circular={false}
                width="45px"
                transparent
              />
            )}
            {canDelete && (
              <Button
                onClick={onDelete}
                icon={<DeleteIcon />}
                circular={false}
                width="45px"
                transparent
              />
            )}
          </div>

          <div className={styles.cUser}>
            <AvatarUser
              imageUser={answer.user?.image}
              tagUser={answer.user?.initials}
              descripcionCorta={answer.user?.shortDescription ?? ''}
              descripcionLarga={answer.user?.longDescription ?? ''}
              nombreCompleto={answer.user?.completeName ?? ''}
              direction='right'
              onClick={() => openForumUserDetail(answer.user?.email)}
            />
            <p className={styles.usrName}>{answer.user?.completeName}</p>
            <p className={styles.cmntAt}>{answer.createdDate.toString()}</p>
          </div>

          <div className={styles.editSwap}>
          <AnimatePresence initial={false} mode="wait">
            {isEditing ? (
              <motion.div
                key="editor"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className={styles.inlineEditor}
              >
                <Suspense fallback={<SkeletonEditorComment isInEditorComponent />}>
                  <EditorInput
                    isInternal
                    initialContent={answer.textResponse}
                    onChangeContent={setEditedContent}
                  />
                </Suspense>
                <div className={`buttonList ${styles.editActions}`}>
                  <Button text="Guardar" onClick={saveEdit} />
                  <Button
                    text="Cancelar"
                    onClick={cancelEdit}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                <div
                  className={styles.cText}
                  dangerouslySetInnerHTML={{ __html: answer.textResponse }}
                />
              </motion.div>
            )}
          </AnimatePresence>
          </div>

        </div>
      </div>
    </motion.div>
  );
}
