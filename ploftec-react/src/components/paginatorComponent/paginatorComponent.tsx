import React from 'react'
import { motion, LayoutGroup } from 'framer-motion'
import styles from './paginatorComponent.module.css'
import {
  SkeletonLine
} from '@/components'

interface PaginatorProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  isComponentLoading: boolean
}

export function Paginator({ currentPage, totalPages, onPageChange, isComponentLoading } : PaginatorProps) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

  if (isComponentLoading) {
    return (
      <SkeletonLine/>
    )
  } 

  return (
    <div className={styles.paginator}>
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className={styles.paginatorArrow}
      >
        ‹
      </button>

      <LayoutGroup>
        <ul className={styles.paginatorList}>
          {pages.map(page => (
            <li key={page} className={styles.paginatorItem}>
              <button
                onClick={() => onPageChange(page)}
                className={styles.paginatorButton}
              >
                {page}
                {currentPage === page && (
                  <motion.div
                    layoutId="paginatorHighlight"
                    className={styles.paginatorHighlight}
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      </LayoutGroup>

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className={styles.paginatorArrow}
      >
        ›
      </button>
    </div>
  )
}