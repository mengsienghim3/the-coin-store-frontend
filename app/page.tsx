'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  ArrowUpRight,
  Flame,
  Activity,
  Gauge,
  Layers,
} from 'lucide-react';
import { fetchBanners, fetchGames, Banner, Game } from '../lib/api';
import { TourbillonGauge } from '../components/tourbillon-gauge';
import { QuickTopupModal } from '../components/quick-topup-modal';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card } from '../components/ui/card';

export default function StoreHomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameForTopup, setSelectedGameForTopup] = useState<Game | null>(null);

  useEffect(() => {
    Promise.all([fetchBanners(), fetchGames()]).then(([bannerData, gameData]) => {
      setBanners(bannerData);
      setGames(gameData);
      setLoading(false);
    });
  }, []);

  // Auto-rotate hero banners every 6 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const nextBanner = () => {
    if (banners.length === 0) return;
    setActiveBannerIndex((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    if (banners.length === 0) return;
    setActiveBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const filteredGames = games.filter((game) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      game.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.publisher.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#07080c] text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* Top Tachometer Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-600/15 via-yellow-500/20 to-cyan-500/15 border-b border-white/10 py-2 px-4 text-center text-xs font-semibold text-amber-300 flex items-center justify-center gap-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer-aero" />
        <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
        <span className="font-mono tracking-wide">
          BUGATTI TOURBILLON ENGINE SPEED: 9,000 RPM AUTOMATED GAME DIAMOND DISPATCH
        </span>
      </div>

      {/* Main Titanium Navigation */}
      <header className="sticky top-0 z-40 bg-[#0a0d14]/90 backdrop-blur-xl border-b border-white/10 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3.5 group">
            {/* Logo Hub with Tourbillon Ring */}
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-[1.5px] shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-[14px] bg-[#0c0e17] flex items-center justify-center">
                <Gamepad2 className="w-6 h-6 text-amber-400 stroke-[2.2]" />
              </div>
              <div className="absolute -inset-0.5 rounded-2xl border border-amber-400/40 animate-pulse pointer-events-none" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-none font-mono">
                THE COIN STORE
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] uppercase tracking-widest text-tachometer font-extrabold">
                  Tourbillon Reseller Edition
                </span>
              </div>
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
              className="w-full bg-white/[0.04] border border-white/10 rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60 transition-all font-sans"
            />
          </div>

          {/* Header Action: 24/7 VIP Concierge */}
          <div className="flex items-center gap-3">
            <Button
              variant="hypercar"
              size="sm"
              className="gap-2 rounded-full"
              onClick={() => alert('VIP Concierge Support: 24/7 Telegram & Live Agent Ready')}
            >
              <Headphones className="w-3.5 h-3.5 text-cyan-400" />
              VIP Support
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-10">
        {/* Dynamic Promotional Banner Carousel */}
        {banners.length > 0 && (
          <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl group bg-slate-950 aspect-[21/9] sm:aspect-[24/9] max-h-[380px]">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === activeBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080c] via-[#07080c]/40 to-transparent" />
                <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 z-20 max-w-xl">
                  <Badge variant="tourbillon" className="gap-1.5 mb-2.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Special Promotion
                  </Badge>
                  <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                    {banner.title}
                  </h2>
                </div>
              </div>
            ))}

            {/* Navigation Arrows */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={prevBanner}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  aria-label="Previous banner"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextBanner}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  aria-label="Next banner"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Tachometer Indicator Dots */}
            {banners.length > 1 && (
              <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveBannerIndex(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === activeBannerIndex ? 'w-8 bg-amber-400 shadow-md shadow-amber-400/50' : 'w-2 bg-white/30'
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bugatti Tourbillon Horology Gauge Widget */}
        <TourbillonGauge />

        {/* Game Catalog Section */}
        <section id="games" className="pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-pulse" />
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                  POPULAR TOP-UP
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Instant delivery directly to your game ID via automated provider APIs
              </p>
            </div>

            {/* Category Filter Chips with Animated Indicators */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
              {['all', 'MOBA', 'Battle Royale', 'RPG'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25 scale-105'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                  }`}
                >
                  {cat === 'all' ? 'All Games' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Game Cards Grid (Hypercar Instrument Cards) */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="aspect-[3/4] rounded-3xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {filteredGames.map((game) => (
                <Card
                  key={game.id}
                  className="group relative bg-[#0d101a] hover:bg-[#131828] border-white/10 hover:border-amber-400/60 p-3.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-2xl cursor-pointer overflow-hidden"
                  onClick={() => setSelectedGameForTopup(game)}
                >
                  {/* Subtle aero glow corner indicator */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/0 group-hover:bg-amber-500/15 rounded-bl-full transition-all duration-500 pointer-events-none" />

                  <div>
                    {/* Game Artwork Thumbnail */}
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 mb-3 border border-white/10 shadow-inner">
                      <img
                        src={game.imageUrl}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      />
                      <Badge
                        variant="tourbillon"
                        className="absolute top-2 left-2 text-[9px] px-2 py-0.5"
                      >
                        ⚡ 0.2s Dispatch
                      </Badge>
                    </div>

                    <span className="text-[10px] font-mono text-cyan-400/90 uppercase tracking-widest block mb-0.5">
                      {game.publisher}
                    </span>
                    <h3 className="font-extrabold text-white text-sm line-clamp-1 group-hover:text-amber-300 transition-colors">
                      {game.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px] font-mono">{game.category}</span>
                    <span className="text-amber-400 font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Reload <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Hypercar Performance & Security Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <Card className="p-6 bg-gradient-to-br from-[#0c0f18] to-[#07090e] border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base mb-1">9,000 RPM Injection</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated provider API gateway dispatches diamonds into your game account in seconds.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-[#0c0f18] to-[#07090e] border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base mb-1">Zero-Password Top-Up</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Only your Player ID & Zone ID are needed. Your account credentials stay 100% private.
            </p>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-[#0c0f18] to-[#07090e] border-white/10">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-white text-base mb-1">Cambodian Local Rail</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct checkout support for Bakong KHQR, ABA Pay, and international cards.
            </p>
          </Card>
        </section>
      </main>

      {/* Quick Top-Up Modal (Interactive Cockpit) */}
      <QuickTopupModal
        game={selectedGameForTopup}
        onClose={() => setSelectedGameForTopup(null)}
      />

      {/* Titanium Minimalist Footer */}
      <footer className="mt-20 border-t border-white/10 bg-[#06080d] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 font-mono font-black text-xs">
              BUG
            </div>
            <div>
              <p className="font-bold text-slate-300">The Coin Store — Tourbillon Reseller Edition</p>
              <p className="text-[11px]">All game trademarks belong to their respective publishers.</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Privacy Policy
            </Link>
            <a href="#support" className="hover:text-amber-400 transition-colors">
              Contact Concierge
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
