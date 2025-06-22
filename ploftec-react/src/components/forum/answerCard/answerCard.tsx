'use client';

import { useState, useEffect } from 'react';
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { CheckCircle } from 'lucide-react';
import AvatarUser from '@/components/avatarUserComponent/avatarUser';
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

interface Props {
  answer: AnswerResponse;
  canDelete: boolean;
  canEdit: boolean;
  isNew?: boolean;
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
  onUpvote, 
  onDownvote, 
  onDelete,
  onSaveEdit
}: Props) {

  const [loadingUpVote, setLoadingUpVote] = useState(false);
  const [loadingDownVote, setLoadingDownVote] = useState(false);
  const [animateNew, setAnimateNew] = useState(false);
  /** Nuevos estados para inline edit */
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(answer.textResponse);
  const isVoting = loadingUpVote || loadingDownVote;
  const isPositiveVoted = answer.votedPositive;

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
    setDraft(answer.textResponse);
    setIsEditing(true);
  };
  const cancelEdit = () => setIsEditing(false);
  const saveEdit = async () => {
    if (onSaveEdit) {
      await onSaveEdit(draft, answer.codeAnswer);
      setIsEditing(false);
    }
  };

  // cargamos el editor **solo** cuando isEditing===true
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

  useEffect(() => {
    if (isNew) {
      // Espera un frame para montar con animación
      requestAnimationFrame(() => {
        setAnimateNew(true);
      });
    }
  }, [isNew]);
  
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
          : undefined
      }
      className="answer-card"
    >
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
            />
            <p className={styles.usrName}>{answer.user?.completeName}</p>
            <p className={styles.cmntAt}>{answer.createdDate.toString()}</p>
          </div>

          <AnimatePresence initial={false}>
            {isEditing ? (
              <motion.div
                key="editor"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{
                  opacity: 0,
                  height: 0,
                }}
                transition={{
                  // primero se desvanece rápido...
                  opacity: { duration: 0.15, ease: 'easeInOut' },
                  // luego, con un spring más “suave”, colapsa la altura
                  height: {
                    type: 'spring',
                    stiffness: 200,
                    damping: 25,
                    mass: 0.5,
                    delay: 0.1
                  }
                }}
                className={styles.inlineEditor}
              >
                <Suspense fallback={<SkeletonEditorComment isInEditorComponent />}>
                  <EditorInput
                    isInternal
                    initialContent={draft}
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
    </motion.div>
  );
}
