type SkeletonEditorCommentProps = {
  isInEditorComponent?: boolean;
};

export function SkeletonEditorComment({ isInEditorComponent = false }: SkeletonEditorCommentProps) {
  return (
    isInEditorComponent ? (
      <div className="skeleton-editor-wrapper" style={{ padding: '0' }}>
        <div className="skeleton-toolbar" />
        <div className="skeleton-editor-area" />
        <div className="skeleton-footer">
          <div className="skeleton-charcount" />
          <div className="skeleton-button" />
        </div>
      </div>
    ) : (
      <div className="skeleton-editor-wrapper">
        <div className="skeleton-toolbar" />
        <div className="skeleton-editor-area" />
        <div className="skeleton-footer">
          <div className="skeleton-charcount" />
          <div className="skeleton-button" />
        </div>
      </div>
    )
  );
}
