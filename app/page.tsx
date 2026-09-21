"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Gamepad2,
  Sparkles,
  Search,
  ShieldCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
  Headphones,
  CreditCard,
  Shield,
  ArrowUpRight,
  Flame,
} from "lucide-react";
import { fetchBanners, fetchGames, Banner, Game } from "../lib/api";

export default function StoreHomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    Promise.all([fetchBanners(), fetchGames()]).then(
      ([bannerData, gameData]) => {
        setBanners(bannerData);
        setGames(gameData);
        setLoading(false);
      },
    );
  }, []);

  // Auto-rotate hero banners every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const nextBanner = () => {
    if (banners.length === 0) return;
    setActiveBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    if (banners.length === 0) return;
    setActiveBannerIndex(
      (prev) => (prev - 1 + banners.length) % banners.length,
    );
  };

  const filteredGames = games.filter((game) => {
    const matchesCategory =
      selectedCategory === "all" ||
      game.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.publisher.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#07080e] text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-600/20 via-yellow-500/20 to-amber-600/20 border-b border-amber-500/20 py-2 px-4 text-center text-xs font-semibold text-amber-300 flex items-center justify-center gap-2">
        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
        <span>
          Instant Automated Game Diamond Delivery — Direct Reseller Provider
          Connection
        </span>
      </div>

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-40 bg-[#0c0e17]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/25 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-none">
                THE COIN STORE
              </span>
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">
                Game Diamond Reseller
              </span>
            </div>
          </Link>

          {/* Quick Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Mobile Legends, Free Fire, PUBG..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all"
            />
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <a
              href="#support"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-amber-400 transition-colors"
            >
              <Headphones className="w-3.5 h-3.5 text-amber-400" />
              24/7 Support
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Dynamic Promotional Banner Carousel (Banner API) */}
        {banners.length > 0 && (
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl mb-10 group bg-slate-950 aspect-[21/9] sm:aspect-[24/9] max-h-[380px]">
            {/* Banner Image Slides */}
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === activeBannerIndex
                    ? "opacity-100 z-10"
                    : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 z-20 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-2 backdrop-blur-md">
                    <Sparkles className="w-3 h-3" /> Special Promo
                  </div>
                  <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                    {banner.title}
                  </h2>
                </div>
              </div>
            ))}

            {/* Carousel Navigation Arrows */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={prevBanner}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous banner"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextBanner}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next banner"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Pagination Indicators */}
            {banners.length > 1 && (
              <div className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveBannerIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === activeBannerIndex
                        ? "w-6 bg-amber-400"
                        : "w-2 bg-white/30"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Feature / Value Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="p-4 rounded-2xl bg-[#0e111a] border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Instant Reload</div>
              <div className="text-[11px] text-slate-400">
                Automated provider delivery
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e111a] border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">100% Secure</div>
              <div className="text-[11px] text-slate-400">
                No game password required
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e111a] border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Local Payment</div>
              <div className="text-[11px] text-slate-400">
                KHQR, ABA & Bakong
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0e111a] border border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">24/7 Support</div>
              <div className="text-[11px] text-slate-400">
                Always online assistance
              </div>
            </div>
          </div>
        </div>

        {/* Game Catalog Section */}
        <section id="games" className="mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <Flame className="w-6 h-6 text-amber-500 fill-amber-500" />
                Popular Game Top-Up
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select your game to top-up diamonds, vouchers, or battle passes
                instantly
              </p>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
              {["all", "MOBA", "Battle Royale", "RPG"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                      : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5"
                  }`}
                >
                  {cat === "all" ? "All Games" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Game Cards Grid (Dalin Store style) */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="aspect-[3/4] rounded-2xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  className="group relative rounded-2xl bg-[#0e111a] hover:bg-[#151926] border border-white/10 hover:border-amber-500/50 p-3 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-xl overflow-hidden cursor-pointer"
                  onClick={() =>
                    alert(
                      `Top up for ${game.name} will connect to the reseller provider order form!`,
                    )
                  }
                >
                  {/* Game Artwork */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 mb-3 border border-white/5">
                    <img
                      src={game.imageUrl}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-extrabold text-[9px] uppercase tracking-wider shadow-md">
                      Instant
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider block">
                      {game.publisher}
                    </span>
                    <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-amber-300 transition-colors">
                      {game.name}
                    </h3>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      {game.category}
                    </span>
                    <span className="text-amber-400 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Top-Up <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/10 bg-[#090b12] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-300">
                The Coin Store — Reseller Platform
              </p>
              <p className="text-[11px]">
                All game titles and trademarks are property of their respective
                owners.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Privacy Policy
            </Link>
            <a
              href="#support"
              className="hover:text-amber-400 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
