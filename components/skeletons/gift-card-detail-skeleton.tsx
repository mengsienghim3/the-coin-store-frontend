import React from "react";
import { Skeleton } from "../ui/skeleton";

export function GiftCardDetailSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b091f] text-slate-100 selection:bg-pink-500 selection:text-white">
      {/* Top Navbar Skeleton */}
      <header className="sticky top-0 z-40 bg-[#0d0a27]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <Skeleton className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl" />
            <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="w-20 h-2.5 rounded-full" />
              <Skeleton className="w-32 sm:w-44 h-4 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="w-24 h-7 sm:h-8 rounded-full" />
          </div>
        </div>
      </header>

      {/* Main Grid Skeleton */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">
          {/* Left Column: Gift Card Details & Denominations */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <div className="rounded-2xl sm:rounded-3xl bg-[#141033] border border-white/10 p-3.5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-start gap-4">
                <Skeleton className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="w-24 h-4 rounded-full" />
                  <Skeleton className="w-48 sm:w-64 h-6 rounded-lg" />
                  <Skeleton className="w-full max-w-md h-12 rounded-lg" />
                </div>
              </div>

              {/* Denominations Grid Skeleton */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <Skeleton className="w-36 h-4 rounded" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="rounded-xl sm:rounded-2xl bg-[#191442]/60 border border-white/10 p-3 sm:p-4 space-y-2"
                    >
                      <Skeleton className="w-16 h-4 rounded" />
                      <Skeleton className="w-20 h-5 rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Checkout Summary Skeleton */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl sm:rounded-3xl bg-[#141033] border border-white/10 p-3.5 sm:p-5 shadow-xl space-y-4 sticky top-24">
              <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                <Skeleton className="w-6 h-6 rounded-lg" />
                <Skeleton className="w-36 h-5 rounded-md" />
              </div>

              {/* Email Input Skeleton */}
              <div className="space-y-1.5">
                <Skeleton className="w-28 h-3.5 rounded" />
                <Skeleton className="w-full h-11 rounded-xl" />
              </div>

              {/* Payment Card Skeleton */}
              <Skeleton className="w-full h-16 rounded-xl sm:rounded-2xl" />

              {/* Action Button Skeleton */}
              <Skeleton className="w-full h-11 sm:h-12 rounded-xl" />

              {/* Badges Skeleton */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <Skeleton className="w-40 h-3 rounded" />
                <Skeleton className="w-48 h-3 rounded" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
