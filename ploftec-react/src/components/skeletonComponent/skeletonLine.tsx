
type SkeletonLineProps = {
  internal?: boolean;
}

export function SkeletonLine({internal=false}: SkeletonLineProps) {
  return (
    <div className="card-skeleton"style={{paddingLeft: internal ? "0px" : "10px"}}>
      <div className="header-skeleton">
        <div className="details">
          <span className="title-skeleton" style={{ marginTop: "18px", textAlign: internal ? "start" : "unset", width: internal ? "100%" : "90%"}}></span>
        </div>
      </div>
    </div>
  );
}