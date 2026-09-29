"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Gamepad2,
  Gift,
  Sparkles,
  Search,
  ChevronLeft,
  ChevronRight,
  Headphones,
  ArrowUpRight,
} from "lucide-react";
import {
  fetchBanners,
  fetchGames,
  fetchGiftCards,
  Banner,
  Game,
  GiftCard,
} from "../lib/api";
import { useTranslations } from "next-intl";
import { useLanguage } from "../context/language-context";
import { getDisplayName, getBannerTitle } from "../lib/i18n";
import Footer from "../components/Footer";
import { CatalogSkeleton } from "../components/skeletons/catalog-skeleton";

export default function StoreHomePage() {
  const { lang, setLang } = useLanguage();
  const tNav = useTranslations("Navigation");
  const tCatalog = useTranslations("Catalog");
  const tHero = useTranslations("Hero");
  const [banners, setBanners] = useState<Banner[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'games' | 'giftcards'
  const [activeTab, setActiveTab] = useState<"games" | "giftcards">("games");
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    Promise.all([fetchBanners(), fetchGames(), fetchGiftCards()]).then(
      ([bannerData, gameData, giftCardData]) => {
        setBanners(bannerData);
        setGames(gameData);
        setGiftCards(giftCardData);
        setLoading(false);
      },
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
    setActiveBannerIndex(
      (prev) => (prev - 1 + banners.length) % banners.length,
    );
  };

  // Switch tab
  const handleTabChange = (tab: "games" | "giftcards") => {
    setActiveTab(tab);
  };

  // Filter games
  const filteredGames = games.filter((g) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchesEn = (g.name || "").toLowerCase().includes(q);
    const matchesKh = (g.nameKh || "").toLowerCase().includes(q);
    const matchesPub = (g.publisher || "").toLowerCase().includes(q);
    return matchesEn || matchesKh || matchesPub;
  });

  // Filter gift cards
  const filteredGiftCards = giftCards.filter((gc) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchesEn = (gc.name || "").toLowerCase().includes(q);
    const matchesKh = (gc.nameKh || "").toLowerCase().includes(q);
    const matchesBrand = (gc.brand || "").toLowerCase().includes(q);
    return matchesEn || matchesKh || matchesBrand;
  });

  const currentBanner = banners[activeBannerIndex] || banners[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#0b091f] text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. NAVBAR (Inspired by Reference Design: Clean pill search & links)       */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#0d0a27]/85 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 group shrink-0"
          >
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-300 border border-white/10 bg-[#0e0c26]">
              <img
                src="/logo.webp"
                alt="The Coin Store Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-white block leading-none">
                THE COIN STORE
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-purple-400 font-bold">
                Digital Reseller
              </span>
            </div>
          </Link>

          {/* Centered Pill Search Input (Desktop/Tablet) */}
          <div className="hidden md:flex flex-1 max-w-md mx-6 relative">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={tNav("searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 rounded-full pl-11 pr-5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400/80 focus:ring-2 focus:ring-purple-400/20 transition-all font-sans"
            />
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <button
              onClick={() => handleTabChange("games")}
              className={`transition-colors ${activeTab === "games" ? "text-purple-400 font-bold" : "hover:text-white"}`}
            >
              {tNav("games")}
            </button>
            <button
              onClick={() => handleTabChange("giftcards")}
              className={`transition-colors ${activeTab === "giftcards" ? "text-purple-400 font-bold" : "hover:text-white"}`}
            >
              {tNav("giftCards")}
            </button>
            <a href="#promos" className="hover:text-white transition-colors">
              {tNav("hotDeals")}
            </a>
            <a href="#support" className="hover:text-white transition-colors">
              {tNav("faq")}
            </a>
          </nav>

          {/* Right Action: Language Switcher & Support */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Language Switcher Pill */}
            <div className="flex items-center bg-white/5 border border-white/10 p-0.5 sm:p-1 rounded-full shadow-inner">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 ${
                  lang === "en"
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Switch to English"
              >
                <span>🇬🇧</span>
                <span>EN</span>
              </button>
              <button
                type="button"
                onClick={() => setLang("km")}
                className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 ${
                  lang === "km"
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-600/30 font-khmer"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="ប្តូរទៅភាសាខ្មែរ"
              >
                <span>🇰🇭</span>
                <span>ខ្មែរ</span>
              </button>
            </div>

            <button
              onClick={() => alert(tNav("vipAlert"))}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-purple-300 transition-all"
            >
              <Headphones className="w-3.5 h-3.5 text-purple-400" />
              <span>{tNav("vipSupport")}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. SIMPLE BANNER (Directly Under Nav Bar)                                 */}
      {/* ========================================================================= */}
      {banners.length > 0 && (
        <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-1 sm:pb-2 w-full">
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl group bg-[#110e2d] aspect-[16/9] sm:aspect-[24/8] max-h-[360px]">
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
                  alt={getBannerTitle(banner, lang)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b091f] via-[#0b091f]/30 to-transparent" />
                <div className="absolute bottom-3.5 left-3.5 sm:bottom-8 sm:left-8 z-20 max-w-xl pr-12 sm:pr-0">
                  <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-purple-600/40 border border-purple-400/40 text-purple-200 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-1 sm:mb-2 backdrop-blur-md">
                    <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-pink-400" />
                    {tHero("livePromo")}
                  </span>
                  <h2 className="text-base sm:text-3xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                    {getBannerTitle(banner, lang)}
                  </h2>
                </div>
              </div>
            ))}

            {/* Carousel Navigation Arrows */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={prevBanner}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  aria-label="Previous banner"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={nextBanner}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  aria-label="Next banner"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            )}

            {/* Pagination Indicators */}
            {banners.length > 1 && (
              <div className="absolute bottom-2.5 right-3 sm:bottom-4 sm:right-6 z-20 flex items-center gap-1.5 sm:gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveBannerIndex(i)}
                    className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                      i === activeBannerIndex
                        ? "w-6 sm:w-8 bg-purple-400 shadow-md shadow-purple-400/50"
                        : "w-1.5 sm:w-2 bg-white/30"
                    }`}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. SECTION TABS: "GAME TOP-UP" vs "DIGITAL GIFT CARDS"                    */}
      {/* ========================================================================= */}
      <section
        id="catalog"
        className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 w-full"
      >
        {/* Mobile Search Input (Visible on mobile screens) */}
        <div className="md:hidden w-full relative mb-3.5">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={tNav("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.06] hover:bg-white/[0.09] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-purple-400/80 focus:ring-1 focus:ring-purple-400/30 transition-all font-sans"
          />
        </div>

        <div className="flex items-center justify-start pb-4 sm:pb-6 border-b border-white/[0.08]">
          {/* Main Dual Toggle Tabs */}
          <div className="inline-flex p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-[#161239] border border-white/10 shadow-inner w-full sm:w-auto">
            <button
              onClick={() => handleTabChange("games")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === "games"
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-600/30 scale-100"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span>{tCatalog("tabGames")}</span>
            </button>

            <button
              onClick={() => handleTabChange("giftcards")}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === "giftcards"
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-600/30 scale-100"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Gift className="w-4 h-4" />
              <span>{tCatalog("tabGiftCards")}</span>
            </button>
          </div>
        </div>

        {/* ======================================================================= */}
        {/* 4. LISTINGS GRID (Games or Gift Cards)                                  */}
        {/* ======================================================================= */}
        <div className="pt-4 sm:pt-8">
          {loading ? (
            <CatalogSkeleton count={12} />
          ) : activeTab === "games" ? (
            /* GAMES LISTING */
            filteredGames.length === 0 ? (
              <div className="py-12 sm:py-16 text-center">
                <Gamepad2 className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-white font-bold">
                  {tCatalog("noGamesFound")}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {tCatalog("searchEmptyHint")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-5">
                {filteredGames.map((game) => (
                  <Link
                    key={game.id}
                    href={`/games/${game.slug || game.id}`}
                    className="group relative rounded-2xl sm:rounded-3xl bg-[#141033] hover:bg-[#1a1642] border border-white/10 hover:border-purple-400/60 p-2.5 sm:p-3.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 sm:hover:-translate-y-2 shadow-xl hover:shadow-purple-900/30 cursor-pointer overflow-hidden"
                  >
                    {/* Glowing hover aura */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/0 group-hover:bg-purple-500/20 rounded-bl-full transition-all duration-500 pointer-events-none" />

                    <div>
                      {/* Artwork Container */}
                      <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 mb-2 sm:mb-3 border border-white/10 shadow-inner">
                        <img
                          src={game.imageUrl}
                          alt={getDisplayName(game, lang)}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 rounded-md bg-purple-600/90 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow">
                          {tCatalog("instantBadge")}
                        </span>
                      </div>

                      <span className="text-[9px] sm:text-[10px] font-mono text-purple-300/80 uppercase tracking-widest block mb-0.5 truncate">
                        {game.publisher || tCatalog("officialBadge")}
                      </span>
                      <h3 className="font-extrabold text-white text-xs sm:text-sm line-clamp-1 group-hover:text-pink-300 transition-colors">
                        {getDisplayName(game, lang)}
                      </h3>
                    </div>

                    <div className="mt-2.5 sm:mt-3 pt-2 sm:pt-2.5 border-t border-white/10 flex items-center justify-end text-xs">
                      <span className="text-purple-300 font-bold text-[10px] sm:text-xs flex items-center gap-0.5 group-hover:text-pink-300 group-hover:translate-x-0.5 transition-all">
                        {tCatalog("reloadAction")}{" "}
                        <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : /* GIFT CARDS LISTING */
          filteredGiftCards.length === 0 ? (
            <div className="py-12 sm:py-16 text-center">
              <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-white font-bold">
                {tCatalog("noGiftCardsFound")}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {tCatalog("searchEmptyHint")}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 sm:gap-4 lg:gap-5">
              {filteredGiftCards.map((card) => (
                <Link
                  key={card.id}
                  href={`/gift-cards/${card.slug || card.id}`}
                  className="group relative rounded-2xl sm:rounded-3xl bg-[#141033] hover:bg-[#1a1642] border border-white/10 hover:border-pink-400/60 p-2.5 sm:p-3.5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 sm:hover:-translate-y-2 shadow-xl hover:shadow-pink-900/30 cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/0 group-hover:bg-pink-500/20 rounded-bl-full transition-all duration-500 pointer-events-none" />

                  <div>
                    {/* Gift Card Artwork */}
                    <div className="relative aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 mb-2 sm:mb-3 border border-white/10 shadow-inner">
                      <img
                        src={card.imageUrl}
                        alt={getDisplayName(card, lang)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 px-1.5 sm:px-2 py-0.5 rounded-md bg-pink-600/90 backdrop-blur-md text-white text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow">
                        {tCatalog("digitalCodeBadge")}
                      </span>
                    </div>

                    <span className="text-[9px] sm:text-[10px] font-mono text-pink-300/80 uppercase tracking-widest block mb-0.5 truncate">
                      {card.brand || "Digital Voucher"}
                    </span>
                    <h3 className="font-extrabold text-white text-xs sm:text-sm line-clamp-1 group-hover:text-pink-300 transition-colors">
                      {getDisplayName(card, lang)}
                    </h3>
                  </div>

                  <div className="mt-2.5 sm:mt-4 pt-2 sm:pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-slate-400 block leading-none">
                        {tCatalog("fromPrice")}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-amber-400">
                        {card.startingPrice || "$5.00"}
                      </span>
                    </div>
                    <span className="text-pink-300 font-bold text-[10px] sm:text-xs flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      {tCatalog("buyAction")}{" "}
                      <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modern Marketplace Footer */}
      <Footer />
    </div>
  );
}
