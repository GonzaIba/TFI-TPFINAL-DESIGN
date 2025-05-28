'use client';

import { useState } from 'react';
import { ArrowDropUp, ArrowDropDown } from '@mui/icons-material';
import { CheckCircle } from 'lucide-react';
import AvatarUser from '@/components/avatarUserComponent/avatarUser';
import Button from '@/components/buttonComponent/button';
import { AnswerResponse } from '@/lib/types/forum';
import styles from '../publicationDetail/publicationDetail.module.css';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ReplyIcon from '@mui/icons-material/Reply';
import { Colors } from '@/theme/colors';
import {VoteNumber} from '@/components';

interface Props {
  answer: AnswerResponse;
  onUpvote: () => Promise<void>;
  onDownvote: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function AnswerCard({ answer, onUpvote, onDownvote, onDelete }: Props) {

  const [loadingUpVote, setLoadingUpVote] = useState(false);
  const [loadingDownVote, setLoadingDownVote] = useState(false);
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

  return (
    <div className={styles.commentWrp}>
      <div className={`${styles.comment} ${styles.pubContainer}`}>
        <div className={styles.cScore}>
          {/* <Button
            onClick={handleOnUpVote}
            icon={<ArrowDropUp sx={{ fontSize: 48, color: isPositiveVoted === true ? Colors.primary : Colors.white }} />}
            circular={true}
            transparent
          /> */}

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

          {/* <p className={styles.scoreNumber}>{answer.votos}</p> */}
          <VoteNumber value={answer.votes} />       
          {answer.correctAnswer && (
            <CheckCircle className="text-green-500" size={34} />
          )}
          {/* <Button
            onClick={handleOnDownVote}
            icon={<ArrowDropDown sx={{ fontSize: 48, color: isPositiveVoted === false ? Colors.primary : Colors.white  }} />}
            circular={true}
            transparent
          /> */}

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
            imageUser={answer.user?.image}
            tagUser={answer.user?.initials}
            descripcionCorta={answer.user?.shortDescription ?? ''}
            descripcionLarga={answer.user?.longDescription ?? ''}
            nombreCompleto={answer.user?.completeName ?? ''}
          />
          <p className={styles.usrName}>{answer.user?.completeName}</p>
          <p className={styles.cmntAt}>{answer.createdDate.toString()}</p>
        </div>

        <p className={styles.cText}>
          <span className={styles.cBody} dangerouslySetInnerHTML={{ __html: answer.textResponse }} />
        </p>
      </div>
    </div>
  );
}
