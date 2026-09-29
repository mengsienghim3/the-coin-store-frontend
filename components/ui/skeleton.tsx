import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export function Skeleton({
  className = "",
  shimmer = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-md bg-white/[0.07] ${
        shimmer
          ? "after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_1.6s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/[0.08] after:to-transparent"
          : "animate-pulse"
      } ${className}`}
      {...props}
    />
  );
}
