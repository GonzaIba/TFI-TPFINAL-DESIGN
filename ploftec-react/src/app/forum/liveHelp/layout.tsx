import type { ReactNode } from 'react';

export default function LiveHelpLayout({
  children,
  panel,
}: {
  children: ReactNode;
  panel: ReactNode;
}) {
  return (
    <div style={{ position: 'relative', minHeight: '100dvh' }}>
      {/* Base content (feed + filters) */}
      <div>{children}</div>

      {/* Right-side panel for details */}
      {panel}
    </div>
  );
}
