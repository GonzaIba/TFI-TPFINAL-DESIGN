'use client';

import { SkeletonLine } from "./skeletonLine";

export function SkeletonLabelCard() {
  return (
    <div className="label-card-skeleton">
      <SkeletonLine internal></SkeletonLine>
      <SkeletonLine internal></SkeletonLine>
      <SkeletonLine internal></SkeletonLine>
    </div>
  );
}
