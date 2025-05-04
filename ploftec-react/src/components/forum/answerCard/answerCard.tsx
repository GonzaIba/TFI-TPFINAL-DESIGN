'use client';

import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { CheckCircle } from 'lucide-react';
import AvatarUser from '@/components/avatarUserComponent/avatarUser';
import Button from '@/components/buttonComponent/button'; // Nuevo botón
import { AnswerResponse } from '@/lib/types/forum';
import styles from '../publicationDetail/publicationDetail.module.css';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ReplyIcon from '@mui/icons-material/Reply';

interface Props {
  answer: AnswerResponse;
  onUpvote: () => Promise<void>;
  onDownvote: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function AnswerCard({ answer, onUpvote, onDownvote, onDelete }: Props) {
  return (
    <div className={styles.commentWrp}>
      <div className={`${styles.comment} ${styles.pubContainer}`}>
        <div className={styles.cScore}>
          <Button
            onClick={onUpvote}
            icon={<ArrowDropUp />}
            circular
          />
          <p className={styles.scoreNumber}>{answer.votos}</p>
          {answer.respuestaCorrecta && (
            <CheckCircle className="text-green-500" size={34} />
          )}
          <Button
            onClick={onDownvote}
            icon={<ArrowDropDown />}
            circular
          />
        </div>

        <div className={styles.cControls}>
          <Button
            onClick={onDelete}
            icon={<DeleteIcon />}
            circular
          />
          <Button
            onClick={() => {}}
            icon={<EditIcon />}
            circular
          />
          <Button
            onClick={() => {}}
            icon={<ReplyIcon />}
            circular
          />
        </div>

        <div className={styles.cUser}>
          <AvatarUser
            imageUser={answer.usuario?.image}
            tagUser={answer.usuario?.iniciales}
            descripcionCorta={answer.usuario?.descripcionCorta ?? ''}
            descripcionLarga={answer.usuario?.descripcionLarga ?? ''}
            nombreCompleto={answer.usuario?.nombreCompleto ?? ''}
          />
          <p className={styles.usrName}>{answer.usuario?.nombreCompleto}</p>
          <p className={styles.cmntAt}>{answer.fechaCreacion.toString()}</p>
        </div>

        <p className={styles.cText}>
          <span className={styles.cBody} dangerouslySetInnerHTML={{ __html: answer.textoRespuesta }} />
        </p>
      </div>
    </div>
  );
}
