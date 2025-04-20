'use client';

import React from 'react';
import { ReactNode, CSSProperties } from 'react';

interface GridItemProps {
  children: ReactNode;
  colSpanXs?: number;
  colSpanSm?: number;
  colSpanMd?: number;
  colSpanLg?: number;
  colSpanXl?: number;
  rowSpanXs?: number;
  rowSpanSm?: number;
  rowSpanMd?: number;
  rowSpanLg?: number;
  rowSpanXl?: number;
}

const GridItem: React.FC<GridItemProps> = ({
  children,
  colSpanXs,
  colSpanSm,
  colSpanMd,
  colSpanLg,
  colSpanXl,
  rowSpanXs,
  rowSpanSm,
  rowSpanMd,
  rowSpanLg,
  rowSpanXl,
}) => {
  const style: CSSProperties = {
    ...(colSpanXs && { ['--col-span-xs' as string]: colSpanXs }),
    ...(colSpanSm && { ['--col-span-sm' as string]: colSpanSm }),
    ...(colSpanMd && { ['--col-span-md' as string]: colSpanMd }),
    ...(colSpanLg && { ['--col-span-lg' as string]: colSpanLg }),
    ...(colSpanXl && { ['--col-span-xl' as string]: colSpanXl }),
    ...(rowSpanXs && { ['--row-span-xs' as string]: rowSpanXs }),
    ...(rowSpanSm && { ['--row-span-sm' as string]: rowSpanSm }),
    ...(rowSpanMd && { ['--row-span-md' as string]: rowSpanMd }),
    ...(rowSpanLg && { ['--row-span-lg' as string]: rowSpanLg }),
    ...(rowSpanXl && { ['--row-span-xl' as string]: rowSpanXl }),
  };

  return <div className="GridItem" style={style}>{children}</div>;
};

export default GridItem;
