'use client'

import AvatarUser from '@/components/avatarUserComponent/avatarUser'

type Props = {
  image?: string
  initials: string
  shortDescription: string | undefined
  longDescription: string | undefined
  fullName: string
  score: number
  since: string | undefined
  index: number
  onClickName: () => void
}

export default function TopUserCard({
  image,
  initials,
  shortDescription,
  longDescription,
  fullName,
  score,
  since,
  index,
  onClickName,
}: Props) {
  const medalColor = index === 0 ? 'gold' : index === 1 ? 'silver' : 'bronze'

  return (
    <div className="top-user">
      <div className={`top-user-avatar-${medalColor}`}>
        <AvatarUser
          imageUser={image}
          tagUser={initials}
          descripcionCorta={shortDescription}
          descripcionLarga={longDescription}
          nombreCompleto={fullName}
          showDetails={true}
          direction='left'
        />
      </div>
      <div className="top-user-data">
        <div className="top-user-detail">
          <span className="top-user-name" onClick={onClickName}>
            {fullName}
          </span>
          <span className="top-user-since">{since}</span>
        </div>
        <div className="top-user-points">
          <span className="medal-icon"><i className={`fas fa-medal ${medalColor}`}></i></span>
          <span className="points">{score}</span>
        </div>
      </div>
    </div>
  )
}
