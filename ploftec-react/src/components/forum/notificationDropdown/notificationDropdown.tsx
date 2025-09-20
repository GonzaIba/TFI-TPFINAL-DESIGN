'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { NotificationsResponse } from '@/lib/types/forum';
import { Button } from '@/components';
import styles from './notificationDropdown.module.css';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { Colors } from '@/theme/colors';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  notifications: NotificationsResponse[] | null;
  onMarkAsRead: (id: number) => Promise<void>;
}

export function NotificationDropdown({ notifications, onMarkAsRead }: Props) {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications?.filter(n => !n.readed)?.length ?? 0;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <div ref={dropdownRef} className={styles.wrapper}>
      <Button
        onClick={() => setOpen(o => !o)}
        icon={
          unreadCount > 0
            ? <NotificationsActiveIcon sx={{ color: Colors.primary }} fontSize="medium" />
            : <NotificationsIcon sx={{ color: Colors.white }} fontSize="medium" />
        }
        transparent
        width="40px"
      />

      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.dropdown}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {notifications?.length === 0 ? (
              <motion.p
                className={styles.empty}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                No tienes notificaciones
              </motion.p>
            ) : (
              notifications?.map(n => (
                <Link key={n.codeNotification} href={"#"}>
                  <motion.a
                    className={`${styles.item} ${n.readed ? '' : styles.unread}`}
                    onClick={!n.readed ? () => onMarkAsRead(n.codeNotification) : undefined}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    {n.message}
                    <time className={styles.time}>
                      {new Date(n.date).toLocaleTimeString()}
                    </time>
                  </motion.a>
                </Link>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
