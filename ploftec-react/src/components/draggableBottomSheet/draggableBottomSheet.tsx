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
  const y = useMotionValue(0)
  const controls = useAnimation()
  const dragControls = useDragControls()
  const sheetRef = useRef<HTMLDivElement>(null)
  const [viewportHeight, setViewportHeight] = useState(0)

  useEffect(() => {
    setViewportHeight(window.innerHeight)
  }, [])

  const MAX_HEIGHT = viewportHeight - 80
  const START_HEIGHT = viewportHeight * 0.75
  const MID_HEIGHT = viewportHeight * 0.6
  const MIN_DRAG_CLOSE = 120

  const handleClose = useCallback(async () => {
    await controls.start({ y: viewportHeight })
    onClose()
  }, [controls, viewportHeight, onClose])

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose()
  }

  const handleDragEnd = async (
    _: unknown,
    info: { offset: { y: number }; velocity: { y: number } }
  ) => {
    const offsetY = info.offset.y
    const velocityY = info.velocity.y

    if (offsetY < -(viewportHeight - MID_HEIGHT) / 2) {
      await controls.start({ y: 0 })
    } else if (offsetY < MIN_DRAG_CLOSE) {
      await controls.start({ y: viewportHeight - MID_HEIGHT })
    } else {
      await controls.start({ y: viewportHeight })
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen && viewportHeight) {
      controls.set({ y: viewportHeight })
      controls.start({ y: viewportHeight - START_HEIGHT })
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
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
              onPointerDown={(e) => dragControls.start(e)}
              style={{
                cursor: 'grab',
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
