'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useAnimation,
  useDragControls
} from 'framer-motion'
import styles from './draggableBottomSheet.module.css'

export default function DraggableBottomSheet({
  children,
  isOpen,
  onClose
}: {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
}) {
  const [viewportHeight, setViewportHeight] = useState(0)
  const sheetRef = useRef<HTMLDivElement>(null)
  const [isDragHandled, setIsDragHandled] = useState(false)
  const y = useMotionValue(0)
  const controls = useAnimation()
  const dragControls = useDragControls()
  const backdropControls = useAnimation()
  const START_HEIGHT = viewportHeight * 0.75
  const MID_HEIGHT = viewportHeight * 0.6
  const MIN_DRAG_CLOSE = 120

  useEffect(() => {
    setViewportHeight(window.innerHeight)
  }, [])


  const handleClose = useCallback(async () => {
    const animateSheet = controls.start({ y: viewportHeight })
    const animateBackdrop = backdropControls.start({
      opacity: 0,
      backdropFilter: 'blur(0px)',
      backgroundColor: 'rgba(0, 0, 0, 0)'
    })
  
    await Promise.all([animateSheet, animateBackdrop])
    onClose()
  }, [controls, backdropControls, viewportHeight, onClose])
  

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isDragHandled) handleClose()
  }

  const handleDragEnd = async (
    _: unknown,
    info: { offset: { y: number }; velocity: { y: number } }
  ) => {
    const offsetY = info.offset.y
    const velocityY = info.velocity.y
  
    // Si arrastró hacia arriba (negativo), no cerrar jamás
    if (offsetY < 0 || velocityY < 0) {
      // Snap al máximo si lo soltó cerca del tope
      await controls.start({ y: 0 })
      setIsDragHandled(false)
      return
    }
  
    // Snap al medio si no llegó a cerrar
    if (offsetY < MIN_DRAG_CLOSE) {
      await controls.start({ y: viewportHeight - MID_HEIGHT })
    }
    // Si arrastró hacia abajo fuerte, cerrar
    else {
      handleClose()
    }
  
    setIsDragHandled(false)
  }

  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    dragControls.start(e)
    setIsDragHandled(true)
  }
  
  const handleDragStop = () => {
    setIsDragHandled(false)
  }

  useEffect(() => {
    if (isOpen && viewportHeight) {
      controls.set({ y: viewportHeight })
      controls.start({ y: viewportHeight - START_HEIGHT })

      backdropControls.start({
        opacity: 1,
        backdropFilter: 'blur(3px)',
        backgroundColor: 'rgba(0,0,0,0.3)'
      })
    }
  }, [isOpen, viewportHeight, controls, START_HEIGHT])

  if (!viewportHeight) return null

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          className={styles.bottomSheetWrapper}
          data-state={isOpen ? 'open' : 'closed'}
          onClick={handleBackdropClick}
          animate={backdropControls}
          transition={{ duration: 0.35 }}
        >
          <motion.div
            ref={sheetRef}
            className={styles.bottomSheet}
            animate={controls}
            initial={{ y: viewportHeight }}
            exit={{ y: viewportHeight }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ y, willChange: 'transform' }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0 }}
            onDragEnd={handleDragEnd}
          >
            <motion.div
              className={styles.dragHandle}
              onPointerDown={handleDragStart}
              onPointerUp={handleDragStop}
              onPointerCancel={handleDragStop}
              style={{
                cursor: isDragHandled ? 'grabbing' : 'grab',
                touchAction: 'none',
                userSelect: 'none'
              }}
            />
            <button
              onClick={handleClose}
              className={styles.closeSheet}
              type="button"
              title="Cerrar"
            >
              &times;
            </button>
            <div className={styles.content}>{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
