'use client'

import { PublicationResponse } from "@/lib/types/forum"
import styles from './topPublicationCard.module.css';

type Props = {
  publication: PublicationResponse
  onClickTitle: () => Promise<void>
}
export function TopPublicationCard({
  publication,
  onClickTitle
}: Props) {
  return (
    <div key={`${publication.codePublication}-${publication.createdDate}`} className={styles.topQuestion}>
      <div className={styles.topQuestionText} onClick={onClickTitle}>
        <span className={styles.topQuestionSpan}>{publication.title}</span>
      </div>
    </div>
  )
}
