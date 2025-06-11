export function SkeletonPublication() {
    return (
      <div className="question">
        <div className="card-skeleton">
          <div className="header-skeleton">
            <div className="avatar-skeleton-container">
              <div className="avatar-skeleton"></div>
            </div>
            <div className="details">
              <span className="title-skeleton"></span>
              <span className="content-skeleton"></span>
              <div className="tag-skeleton-container">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <span className="tag-skeleton" key={idx}></span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }