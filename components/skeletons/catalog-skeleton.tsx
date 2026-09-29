import React from "react";
import { Skeleton } from "../ui/skeleton";

interface CatalogSkeletonProps {
  count?: number;
}

export function CatalogSkeleton({ count = 6 }: CatalogSkeletonProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl sm:rounded-3xl bg-[#141033] border border-white/10 p-2.5 sm:p-3.5 flex flex-col justify-between shadow-xl"
        >
          <div>
            {/* Artwork Container Skeleton */}
            <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 mb-2 sm:mb-3 border border-white/10">
              <Skeleton className="w-full h-full" />
              <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2">
                <Skeleton className="w-12 h-3.5 rounded" />
              </div>
            </div>

            {/* Category / Publisher tag */}
            <Skeleton className="w-16 h-2.5 rounded mb-1.5" />
            {/* Title Line */}
            <Skeleton className="w-full h-4 rounded" />
          </div>

          {/* Price & Action Bottom Row */}
          <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="w-8 h-2 rounded" />
              <Skeleton className="w-12 h-3.5 rounded" />
            </div>
            <Skeleton className="w-12 h-4 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
