'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import CloseIcon from '@mui/icons-material/Close';
import style from './modalComponent.module.css'
import { Button } from '@/components';

type ModalComponentProps = {
  open: boolean
  title?: string
  onClose: () => void
  children: React.ReactNode
  closeIcon?: boolean;
  styles?: React.CSSProperties
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },     // el wrapper ya tiene bg rgba
  exit: { opacity: 0 }
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
}

export function ModalComponent ({
  open,
  onClose,
  children,
  closeIcon = false,
  title,
  styles
}: ModalComponentProps) {
  return (
    <AnimatePresence>
      {open && (
        // WRAPPER: cubre toda la ventana y centra con flex
        <motion.div
          className={style.wrapper}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25 }}
          onClick={onClose}          /* clic fuera = cerrar */
        >
          
          {/* Caja — detenemos el clic para que no burbujee */}
          <motion.div
            className={style.modal}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25 }}
            onClick={e => e.stopPropagation()}
            style={styles}
          >
            {/* Botón de cerrar */}
            {closeIcon && title && (
              <div className={style.modalTitle}>
                <div className={style.titleModal}>
                  {title}
                </div>
                <div className={style.closeModalButton}>
                  <Button
                    onClick={onClose}
                    icon={<CloseIcon fontSize='small'/>}
                    width='35px'
                    height='35px'
                    borderRadius='35px'
                  />
                </div>
              </div>

            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
