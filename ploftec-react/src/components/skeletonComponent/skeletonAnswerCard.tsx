export function SkeletonAnswerCard() {
  return (
    <div className="skeleton-answer-card">
      <div className="skeleton-vote">
        <div className="skeleton-arrow" />
        <div className="skeleton-count" />
        <div className="skeleton-arrow" />
      </div>
      <div className="skeleton-content">
        <div className="skeleton-header">
          <div className="skeleton-avatar" />
          <div className="skeleton-user-info">
            <div className="skeleton-username" />
            {/* <div className="skeleton-time" /> */}
          </div>
        </div>
        <div className="skeleton-text" />
      </div>
    </div>
  );
}
