import React from "react";
import { Skeleton } from "../ui/skeleton";

export function GameDetailSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b091f] text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* Top Navbar Skeleton */}
      <header className="sticky top-0 z-40 bg-[#0d0a27]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
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

      {/* Hero Banner Skeleton */}
      <section className="relative w-full bg-gradient-to-b from-[#181242] via-[#100c2a] to-[#0b091f] border-b border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex flex-row items-center gap-3.5 sm:gap-5">
            {/* Game Cover Art Skeleton */}
            <Skeleton className="w-16 h-16 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl border-2 border-white/10 shrink-0" />

            {/* Title & Metadata Skeletons */}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="w-20 h-4 rounded-full" />
                <Skeleton className="w-24 h-4 rounded-full" />
              </div>
              <Skeleton className="w-48 sm:w-72 h-6 sm:h-9 rounded-lg" />
              <div className="flex items-center gap-3">
                <Skeleton className="w-28 h-3.5 rounded" />
                <Skeleton className="w-20 h-3.5 rounded" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main 3-Step Layout Grid Skeleton */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">
          {/* Left Column: Steps 1 & 2 */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Step 1: Check Game ID Skeleton */}
            <div className="rounded-2xl sm:rounded-3xl bg-[#141033] border border-white/10 p-3.5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl" />
                  <Skeleton className="w-44 sm:w-60 h-5 rounded-md" />
                </div>
                <Skeleton className="w-20 h-5 rounded-full" />
              </div>

              {/* Input Fields Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
                <div className="space-y-1.5">
                  <Skeleton className="w-24 h-3.5 rounded" />
                  <Skeleton className="w-full h-11 sm:h-12 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="w-20 h-3.5 rounded" />
                  <Skeleton className="w-full h-11 sm:h-12 rounded-xl" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Skeleton className="w-48 h-3 rounded" />
                <Skeleton className="w-28 h-8 rounded-xl" />
              </div>
            </div>

            {/* Step 2: Select Package Skeleton */}
            <div className="rounded-2xl sm:rounded-3xl bg-[#141033] border border-white/10 p-3.5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl" />
                  <Skeleton className="w-40 sm:w-56 h-5 rounded-md" />
                </div>
                <Skeleton className="w-24 h-5 rounded-full" />
              </div>

              {/* Filter Pills Skeleton */}
              <div className="flex items-center gap-2 overflow-hidden pb-1">
                <Skeleton className="w-20 h-7 rounded-full shrink-0" />
                <Skeleton className="w-24 h-7 rounded-full shrink-0" />
                <Skeleton className="w-20 h-7 rounded-full shrink-0" />
                <Skeleton className="w-28 h-7 rounded-full shrink-0" />
              </div>

              {/* Package Cards Grid Skeleton */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 pt-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl sm:rounded-2xl bg-[#191442]/60 border border-white/10 p-3 sm:p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <Skeleton className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg" />
                      <Skeleton className="w-12 h-4 rounded-md" />
                    </div>
                    <Skeleton className="w-24 sm:w-32 h-4 rounded-md" />
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <Skeleton className="w-14 h-5 rounded-md" />
                      <Skeleton className="w-8 h-4 rounded" />
                    </div>
                  </div>
                ))}
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

              {/* Summary Items Skeleton */}
              <div className="space-y-2.5 py-1">
                <div className="flex justify-between items-center">
                  <Skeleton className="w-16 h-3.5 rounded" />
                  <Skeleton className="w-28 h-3.5 rounded" />
                </div>
                <div className="flex justify-between items-center">
                  <Skeleton className="w-20 h-3.5 rounded" />
                  <Skeleton className="w-24 h-3.5 rounded" />
                </div>
              </div>

              {/* ABA PAY Card Skeleton */}
              <Skeleton className="w-full h-16 rounded-xl sm:rounded-2xl" />

              {/* Checkbox Skeleton */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03]">
                <Skeleton className="w-4 h-4 rounded" />
                <Skeleton className="flex-1 h-3 rounded" />
              </div>

              {/* Total Due & Button Skeleton */}
              <div className="pt-2 border-t border-white/10 space-y-3">
                <div className="flex justify-between items-center">
                  <Skeleton className="w-20 h-4 rounded" />
                  <Skeleton className="w-24 h-6 rounded-md" />
                </div>
                <Skeleton className="w-full h-11 sm:h-12 rounded-xl" />
              </div>

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
