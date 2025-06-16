'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './modalComponent.module.css'

type ModalComponentProps = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  width?: string
  height?: string
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
  width = '500px',
  height = 'auto'
}: ModalComponentProps) {
  return (
    <AnimatePresence>
      {open && (
        // WRAPPER: cubre toda la ventana y centra con flex
        <motion.div
          className={styles.wrapper}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.25 }}
          onClick={onClose}          /* clic fuera = cerrar */
        >
          {/* Caja — detenemos el clic para que no burbujee */}
          <motion.div
            className={styles.modal}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25 }}
            onClick={e => e.stopPropagation()}
            style={{ width, height }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
