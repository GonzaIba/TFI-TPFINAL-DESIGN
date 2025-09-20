'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from './helpRequestCard.module.css';
import { Button, ChipComponent } from '@/components';

export type HelpRequest = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  createdAgo: string;
  requester: { name: string; avatarUrl?: string };
  status: 'waiting' | 'in_progress' | 'closed';
  visits?: number;
  replies?: number;
  votes?: number;
};

type Props = {
  data: HelpRequest;
  onContact?: (id: string) => void;
  onOpen?: (id: string) => void;
};

export default function HelpRequestCard({ data, onContact, onOpen }: Props) {
  const { id, title, description, tags, requester, createdAgo, status } = data;

  return (
    <motion.article
      className={styles.card}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30, mass: 0.5 }}
      onClick={() => onOpen?.(id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen?.(id)}
    >
      <header className={styles.header}>
        <div className={styles.user}>
          <div className={styles.avatar}>
            {requester.avatarUrl ? (
              <Image src={requester.avatarUrl} alt={requester.name} fill />
            ) : (
              <span>{requester.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className={styles.meta}>
            <h3 className={styles.title}>{title}</h3>
            <span className={styles.time}>Preguntado {createdAgo}</span>
          </div>
        </div>

        <span className={`${styles.badge} ${
          status === 'waiting' ? styles.badgeWaiting :
          status === 'in_progress' ? styles.badgeInProgress : styles.badgeClosed
        }`}>
          {status === 'waiting' ? 'Esperando contacto' :
           status === 'in_progress' ? 'En curso' : 'Cerrada'}
        </span>
      </header>

      <p className={styles.desc}>{description}</p>

      <div className={styles.footer}>
        <div className={styles.tags}>
          {tags.map((t) => (
            <ChipComponent key={t} label={t} />
          ))}
        </div>
        <div className={styles.actions} onClick={(e)=>e.stopPropagation()}>
          <Button
            onClick={() => onContact?.(id)} 
            text='Contactar'
          />
        </div>
      </div>
    </motion.article>
  );
}
