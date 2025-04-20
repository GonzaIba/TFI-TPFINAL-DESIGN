'use client';

import React from 'react';
import { ReactNode, CSSProperties } from 'react';

interface GridProps {
  children: ReactNode;
  colsXs?: number;
  colsSm?: number;
  colsMd?: number;
  colsLg?: number;
  colsXl?: number;
}

const Grid: React.FC<GridProps> = ({
  children,
  colsXs = 2,
  colsSm = 4,
  colsMd = 6,
  colsLg = 8,
  colsXl = 12,
}) => {
  const style: CSSProperties = {
    ['--cols-xs' as string]: colsXs,
    ['--cols-sm' as string]: colsSm,
    ['--cols-md' as string]: colsMd,
    ['--cols-lg' as string]: colsLg,
    ['--cols-xl' as string]: colsXl,
  };

  return <div className="Grid" style={style}>{children}</div>;
};

export default Grid;