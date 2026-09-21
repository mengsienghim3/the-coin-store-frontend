'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gamepad2,
  Gift,
  Sparkles,
  Search,
  ShieldCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
  Headphones,
  ArrowUpRight,
  Flame,
  ThumbsUp,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { fetchBanners, fetchGames, fetchGiftCards, Banner, Game, GiftCard } from '../lib/api';
import { QuickTopupModal } from '../components/quick-topup-modal';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function StoreHomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'games' | 'giftcards'
  const [activeTab, setActiveTab] = useState<'games' | 'giftcards'>('games');
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected item for modal
  const [selectedItem, setSelectedItem] = useState<(Game | GiftCard) | null>(null);

  useEffect(() => {
    Promise.all([fetchBanners(), fetchGames(), fetchGiftCards()]).then(
      ([bannerData, gameData, giftCardData]) => {
        setBanners(bannerData);
        setGames(gameData);
        setGiftCards(giftCardData);
        setLoading(false);
      }
    );
  }, []);

  // Auto-rotate hero banners
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

  // Reset subcategory when switching tabs
  const handleTabChange = (tab: 'games' | 'giftcards') => {
    setActiveTab(tab);
    setSelectedSubCategory('all');
  };

  // Filter games
  const filteredGames = games.filter((g) => {
    const matchesCat =
      selectedSubCategory === 'all' ||
      g.category.toLowerCase() === selectedSubCategory.toLowerCase();
    const matchesSearch =
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.publisher.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filter gift cards
  const filteredGiftCards = giftCards.filter((gc) => {
    const matchesCat =
      selectedSubCategory === 'all' ||
      gc.category.toLowerCase() === selectedSubCategory.toLowerCase();
    const matchesSearch =
      gc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gc.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const currentBanner = banners[activeBannerIndex] || banners[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#0b091f] text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. NAVBAR (Inspired by Reference Design: Clean pill search & links)       */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#0d0a27]/85 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-[1.5px] shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full rounded-[14px] bg-[#0e0c26] flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-pink-400 stroke-[2.2]" />
              </div>
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white block leading-none">
                THE COIN STORE
              </span>
              <span className="text-[10px] uppercase tracking-widest text-purple-400 font-bold">
                Digital Reseller
              </span>
            </div>
          </Link>

          {/* Centered Pill Search Input */}
          <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search game diamonds, vouchers, gift cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 rounded-full pl-11 pr-5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400/80 focus:ring-2 focus:ring-purple-400/20 transition-all font-sans"
            />
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <button
              onClick={() => handleTabChange('games')}
              className={`transition-colors ${activeTab === 'games' ? 'text-purple-400 font-bold' : 'hover:text-white'}`}
            >
              Games
            </button>
            <button
              onClick={() => handleTabChange('giftcards')}
              className={`transition-colors ${activeTab === 'giftcards' ? 'text-purple-400 font-bold' : 'hover:text-white'}`}
            >
              Gift Cards
            </button>
            <a href="#promos" className="hover:text-white transition-colors">
              Hot Deals
            </a>
            <a href="#support" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          {/* Right Action: Support Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Customer VIP Support: 24/7 Live Concierge & Telegram Ready')}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-purple-300 transition-all"
            >
              <Headphones className="w-3.5 h-3.5 text-purple-400" />
              <span>24/7 Support</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO & BANNER SECTION (Inspired by Reference Design Hero)              */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-8 sm:pt-14 pb-12 sm:pb-20">
        {/* Atmospheric ambient glows */}
        <div className="absolute top-1/4 left-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headline & Dual Action Pills */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Premier Digital Gaming & Voucher Exchange</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Buy, Top-Up And <br />
                <span className="text-marketplace-gradient">Collect Game Diamonds.</span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg">
                The world’s most trusted automated marketplace for instant Mobile Legends diamonds, Free Fire, PUBG UC, and digital gaming gift cards.
              </p>

              {/* Dual Pill CTA Buttons (Just like Upload & Explore in reference image) */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    handleTabChange('games');
                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-7 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-purple-600/30 hover:opacity-95 hover:scale-105 transition-all"
                >
                  Top Up Games
                </button>
                <button
                  onClick={() => {
                    handleTabChange('giftcards');
                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-7 py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/20 text-white font-bold text-xs sm:text-sm uppercase tracking-wider hover:scale-105 transition-all backdrop-blur-md"
                >
                  Explore Gift Cards
                </button>
              </div>

              {/* Mini Stats Bar */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 max-w-md">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-white">0.2s</div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide">Instant Reload</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-purple-400">100%</div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide">Automated API</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-pink-400">24/7</div>
                  <div className="text-[11px] text-slate-400 uppercase tracking-wide">VIP Delivery</div>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Visual Showcase Card with Interactive Reaction Badges */}
            <div className="lg:col-span-6 relative flex items-center justify-center">
              {/* Central Floating Card (like reference image sheep avatar card) */}
              <div className="relative w-full max-w-md aspect-[4/3] sm:aspect-[16/11] rounded-[36px] p-2 bg-gradient-to-tr from-purple-500/30 via-pink-500/20 to-indigo-500/30 border border-white/20 shadow-2xl shadow-purple-950/80 backdrop-blur-2xl overflow-hidden group">
                {banners.length > 0 ? (
                  <div className="relative w-full h-full rounded-[30px] overflow-hidden">
                    <img
                      src={currentBanner?.imageUrl}
                      alt={currentBanner?.title || 'Featured Promotion'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0c24] via-[#0e0c24]/40 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6 z-10">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-pink-500/30 border border-pink-400/40 text-[10px] font-bold text-pink-300 uppercase tracking-wider mb-1.5 backdrop-blur-md">
                        Featured Promo
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-white leading-tight drop-shadow-md">
                        {currentBanner?.title}
                      </h3>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full rounded-[30px] bg-[#141133] flex items-center justify-center text-purple-300">
                    <Gamepad2 className="w-16 h-16" />
                  </div>
                )}

                {/* Banner Carousel Controls */}
                {banners.length > 1 && (
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 border border-white/15">
                    <button
                      onClick={prevBanner}
                      className="text-slate-300 hover:text-white p-0.5"
                      aria-label="Previous banner"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[10px] font-mono text-slate-300">
                      {activeBannerIndex + 1}/{banners.length}
                    </span>
                    <button
                      onClick={nextBanner}
                      className="text-slate-300 hover:text-white p-0.5"
                      aria-label="Next banner"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Floating Reaction Badges (Directly inspired by reference image!) */}
              {/* Badge 1: Top Left */}
              <div className="absolute -top-4 -left-2 sm:-left-6 z-20 px-3.5 py-2 rounded-2xl bg-[#1d1844]/90 border border-purple-400/40 shadow-xl backdrop-blur-xl flex items-center gap-2 animate-float-1 pointer-events-none">
                <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <ThumbsUp className="w-3.5 h-3.5 fill-current" />
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-white">Instant Top-Up</div>
                  <div className="text-[9px] text-purple-300">100% Automated</div>
                </div>
              </div>

              {/* Badge 2: Top Right */}
              <div className="absolute -top-6 -right-2 sm:-right-4 z-20 px-3.5 py-2 rounded-2xl bg-[#1d1844]/90 border border-pink-400/40 shadow-xl backdrop-blur-xl flex items-center gap-2 animate-float-2 pointer-events-none">
                <div className="w-7 h-7 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-white">Best Discount</div>
                  <div className="text-[9px] text-pink-300">Direct Reseller</div>
                </div>
              </div>

              {/* Badge 3: Bottom Left */}
              <div className="absolute -bottom-5 -left-4 z-20 px-3.5 py-2 rounded-2xl bg-[#1d1844]/90 border border-cyan-400/40 shadow-xl backdrop-blur-xl flex items-center gap-2 animate-float-3 pointer-events-none">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-white">0.2s Dispatch</div>
                  <div className="text-[9px] text-cyan-300">Zero Wait Time</div>
                </div>
              </div>

              {/* Badge 4: Bottom Right */}
              <div className="absolute -bottom-4 -right-2 sm:-right-6 z-20 px-3.5 py-2 rounded-2xl bg-[#1d1844]/90 border border-emerald-400/40 shadow-xl backdrop-blur-xl flex items-center gap-2 animate-float-1 pointer-events-none">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] font-extrabold text-white">Genuine Keys</div>
                  <div className="text-[9px] text-emerald-300">Official Partners</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SECTION TABS: "GAME TOP-UP" vs "DIGITAL GIFT CARDS"                    */}
      {/* ========================================================================= */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
          {/* Main Dual Toggle Tabs */}
          <div className="inline-flex p-1.5 rounded-2xl bg-[#161239] border border-white/10 shadow-inner">
            <button
              onClick={() => handleTabChange('games')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'games'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-600/30 scale-100'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>Game Diamonds Top-Up</span>
            </button>

            <button
              onClick={() => handleTabChange('giftcards')}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'giftcards'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-600/30 scale-100'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>Digital Gift Cards</span>
            </button>
          </div>

          {/* Subcategory Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
            {activeTab === 'games'
              ? ['all', 'MOBA', 'Battle Royale', 'RPG', 'Shooter'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedSubCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                      selectedSubCategory === cat
                        ? 'bg-white text-slate-950 font-bold'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'All Games' : cat}
                  </button>
                ))
              : ['all', 'PC & Steam', 'Mobile & Apps', 'Console'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedSubCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                      selectedSubCategory === cat
                        ? 'bg-white text-slate-950 font-bold'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'All Gift Cards' : cat}
                  </button>
                ))}
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 4. LISTINGS GRID (Games or Gift Cards)                                  */}
        {/* ======================================================================= */}
        <div className="pt-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] rounded-3xl bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : activeTab === 'games' ? (
            /* GAMES LISTING */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  onClick={() => setSelectedItem(game)}
                  className="group relative rounded-3xl bg-[#141033] hover:bg-[#1a1642] border border-white/10 hover:border-purple-400/60 p-3.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 shadow-xl hover:shadow-purple-900/30 cursor-pointer overflow-hidden"
                >
                  {/* Glowing hover aura */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/0 group-hover:bg-purple-500/20 rounded-bl-full transition-all duration-500 pointer-events-none" />

                  <div>
                    {/* Artwork Container */}
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 mb-3 border border-white/10 shadow-inner">
                      <img
                        src={game.imageUrl}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-purple-600/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider shadow">
                        ⚡ Instant
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-purple-300/80 uppercase tracking-widest block mb-0.5">
                      {game.publisher}
                    </span>
                    <h3 className="font-extrabold text-white text-sm line-clamp-1 group-hover:text-pink-300 transition-colors">
                      {game.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block leading-none">From</span>
                      <span className="text-xs font-black text-amber-400">{game.startingPrice || '$0.99'}</span>
                    </div>
                    <span className="text-purple-300 font-bold text-xs flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Reload <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* GIFT CARDS LISTING */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
              {filteredGiftCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() => setSelectedItem(card)}
                  className="group relative rounded-3xl bg-[#141033] hover:bg-[#1a1642] border border-white/10 hover:border-pink-400/60 p-3.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 shadow-xl hover:shadow-pink-900/30 cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/0 group-hover:bg-pink-500/20 rounded-bl-full transition-all duration-500 pointer-events-none" />

                  <div>
                    {/* Gift Card Artwork */}
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 mb-3 border border-white/10 shadow-inner">
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-pink-600/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider shadow">
                        🎁 Digital Code
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-pink-300/80 uppercase tracking-widest block mb-0.5">
                      {card.brand}
                    </span>
                    <h3 className="font-extrabold text-white text-sm line-clamp-1 group-hover:text-pink-300 transition-colors">
                      {card.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block leading-none">From</span>
                      <span className="text-xs font-black text-amber-400">{card.startingPrice}</span>
                    </div>
                    <span className="text-pink-300 font-bold text-xs flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      Buy <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Quick Top-Up / Purchase Modal */}
      <QuickTopupModal
        item={selectedItem}
        itemType={activeTab === 'games' ? 'game' : 'giftcard'}
        onClose={() => setSelectedItem(null)}
      />

      {/* Modern Marketplace Footer */}
      <footer id="support" className="mt-24 border-t border-white/10 bg-[#080617] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white">The Coin Store — Digital Marketplace</p>
              <p className="text-[11px] text-slate-500">Fast, automated delivery for game currencies and digital gift vouchers.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-purple-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/" className="hover:text-purple-400 transition-colors">
              Privacy Policy
            </Link>
            <a href="#support" className="hover:text-purple-400 transition-colors">
              VIP Concierge
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
