import { AvatarCrownEnum } from "@/lib/types/enum";

interface Props {
  hasCrown?: boolean;
  crown?: AvatarCrownEnum;
}

export default function SkeletonAvatarAndName({ hasCrown = false, crown = AvatarCrownEnum.gold }: Props) {
  return (
    <div className="card-skeleton-topUser">
      <div className="header-skeleton">
        <div className="avatar-skeleton-topUser-container">
          {hasCrown ? (
            <div className={`top-user-avatar-${crown}`}>
              <div className="avatar-skeleton"></div>
            </div>
          ) : (
            <div className="avatar-skeleton"></div>
          )}
        </div>
        <div className="top-user-data">
          <div className="details">
            <span className="avatar-title-skeleton"></span>
            <span className="avatar-content-skeleton"></span>
          </div>
          <div className="top-user-points-skeleton">
            <span className="medal-icon">
              <i className={`fas fa-medal ${crown}`}></i>
            </span>
            <span className="points-skeleton"></span>
          </div>
        </div>
      </div>
    </div>
  );
}