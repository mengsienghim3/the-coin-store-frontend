"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  LogOut,
  Store,
  Plus,
  Trash2,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Server,
  Zap,
  Filter,
  Search,
  SlidersHorizontal,
  Smartphone,
  Monitor,
  Pencil,
  Menu,
  X,
  UploadCloud,
  TrendingUp,
  DollarSign,
  CreditCard,
  BarChart3,
  Clock,
  ArrowUpRight,
  Sparkles,
  ShoppingBag,
  Wallet,
  Key,
  BadgePercent,
  Gamepad2,
  Check,
  Gift,
} from "lucide-react";
import {
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  uploadImage,
  getStoredAdmin,
  clearStoredAdmin,
  verifyAdminSession,
  fetchProviderProfile,
  fetchGames,
  syncGamesWithProvider,
  updateGame,
  deleteGame,
  fetchGiftCards,
  syncGiftCardsWithProvider,
  updateGiftCard,
  deleteGiftCard,
  Banner,
  AdminUser,
  ProviderProfile,
  Game,
  GiftCard,
} from "../../lib/api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Provider Profile & Reseller Balance State
  const [providerProfile, setProviderProfile] =
    useState<ProviderProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Games Catalog State
  const [gamesList, setGamesList] = useState<Game[]>([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [syncingGames, setSyncingGames] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [gameSearchQuery, setGameSearchQuery] = useState("");
  const [gameStatusFilter, setGameStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Gift Cards Catalog State
  const [giftCardsList, setGiftCardsList] = useState<GiftCard[]>([]);
  const [giftCardsLoading, setGiftCardsLoading] = useState(false);
  const [syncingGiftCards, setSyncingGiftCards] = useState(false);
  const [gcSyncNotice, setGcSyncNotice] = useState<string | null>(null);
  const [giftCardSearchQuery, setGiftCardSearchQuery] = useState("");
  const [giftCardStatusFilter, setGiftCardStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Primary Navigation View: 'banners' | 'sales' | 'games' | 'gift-cards'
  const [adminView, setAdminView] = useState<
    "banners" | "sales" | "games" | "gift-cards"
  >("banners");

  // Hamburger Drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cloudflare R2 Upload states for Add modal
  const [isUploadingR2, setIsUploadingR2] = useState(false);
  const [uploadSuccessR2, setUploadSuccessR2] = useState(false);
  const [uploadErrorR2, setUploadErrorR2] = useState<string | null>(null);

  // Cloudflare R2 Upload states for Edit modal
  const [isEditUploadingR2, setIsEditUploadingR2] = useState(false);
  const [uploadEditSuccessR2, setUploadEditSuccessR2] = useState(false);
  const [uploadEditErrorR2, setUploadEditErrorR2] = useState<string | null>(
    null,
  );

  // Edit banner state
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTitleKh, setEditTitleKh] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editLinkUrl, setEditLinkUrl] = useState("");
  const [editOrder, setEditOrder] = useState(1);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editFormError, setEditFormError] = useState<string | null>(null);

  // Mobile App Active View: 'banners' | 'providers' | 'overview'
  const [mobileView, setMobileView] = useState<
    "banners" | "providers" | "overview"
  >("banners");

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  // New banner form state
  const [newTitle, setNewTitle] = useState("");
  const [newTitleKh, setNewTitleKh] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newOrder, setNewOrder] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const session = getStoredAdmin();
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    setAdmin(session.user);

    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const viewParam = searchParams.get("view");
      if (
        viewParam === "games" ||
        viewParam === "sales" ||
        viewParam === "gift-cards" ||
        viewParam === "banners"
      ) {
        setAdminView(viewParam);
      }
    }

    loadBanners();
    loadProfile();
    loadGames();
    loadGiftCards();

    // Verify session validity with backend
    verifyAdminSession(session.token).then((verifiedUser) => {
      if (!verifiedUser) {
        clearStoredAdmin();
        router.replace("/admin/login");
      } else {
        setAdmin(verifiedUser);
      }
    });
  }, [router]);

  const loadProfile = async () => {
    setProfileLoading(true);
    try {
      const data = await fetchProviderProfile();
      if (data) {
        setProviderProfile(data);
      }
    } catch (err) {
      console.error("Failed to load provider profile", err);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadGames = async () => {
    setGamesLoading(true);
    try {
      const data = await fetchGames(true);
      setGamesList(data);
    } catch (err) {
      console.error("Failed to load games", err);
    } finally {
      setGamesLoading(false);
    }
  };

  const handleSyncGames = async () => {
    setSyncingGames(true);
    setSyncNotice(null);
    try {
      const res = await syncGamesWithProvider();
      setGamesList(res.items);
      setSyncNotice(
        `Synced ${res.synced} games from provider (${res.created} new, ${res.updated} updated).`,
      );
      setTimeout(() => setSyncNotice(null), 7000);
    } catch (err: unknown) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to sync games with provider",
      );
    } finally {
      setSyncingGames(false);
    }
  };

  const handleToggleGameStatus = async (game: Game) => {
    setActionLoading(true);
    try {
      const updated = await updateGame(game.id, { isActive: !game.isActive });
      setGamesList((prev) => prev.map((g) => (g.id === game.id ? updated : g)));
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : "Failed to toggle game status",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const loadGiftCards = async () => {
    setGiftCardsLoading(true);
    try {
      const data = await fetchGiftCards(true);
      setGiftCardsList(data);
    } catch (err) {
      console.error("Failed to load gift cards", err);
    } finally {
      setGiftCardsLoading(false);
    }
  };

  const handleSyncGiftCards = async () => {
    setSyncingGiftCards(true);
    setGcSyncNotice(null);
    try {
      const res = await syncGiftCardsWithProvider();
      setGiftCardsList(res.items);
      setGcSyncNotice(
        `Synced ${res.synced} gift cards from provider (${res.created} new, ${res.updated} updated).`,
      );
      setTimeout(() => setGcSyncNotice(null), 7000);
    } catch (err: unknown) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to sync gift cards with provider",
      );
    } finally {
      setSyncingGiftCards(false);
    }
  };

  const handleToggleGiftCardStatus = async (gc: GiftCard) => {
    setActionLoading(true);
    try {
      const updated = await updateGiftCard(gc.id, { isActive: !gc.isActive });
      setGiftCardsList((prev) =>
        prev.map((item) => (item.id === gc.id ? updated : item)),
      );
    } catch (err: unknown) {
      alert(
        err instanceof Error
          ? err.message
          : "Failed to toggle gift card status",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const loadBanners = async () => {
    setLoading(true);
    try {
      const data = await fetchBanners(true); // get all banners including inactive
      setBanners(data);
    } catch (err) {
      console.error("Failed to load banners", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (banner: Banner) => {
    setActionLoading(true);
    try {
      const updated = await updateBanner(banner.id, {
        isActive: !banner.isActive,
      });
      setBanners((prev) => prev.map((b) => (b.id === banner.id ? updated : b)));
    } catch (err: unknown) {
      alert(
        err instanceof Error ? err.message : "Failed to update banner status",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotional banner?"))
      return;
    setActionLoading(true);
    try {
      await deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to delete banner");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFileUpload = async (file: File, target: "new" | "edit") => {
    if (!file) return;
    if (target === "new") {
      setIsUploadingR2(true);
      setUploadErrorR2(null);
      setUploadSuccessR2(false);
      try {
        const res = await uploadImage(file);
        setNewImageUrl(res.url);
        setUploadSuccessR2(true);
      } catch (err: unknown) {
        setUploadErrorR2(
          err instanceof Error
            ? err.message
            : "Failed to upload image to Cloudflare R2",
        );
      } finally {
        setIsUploadingR2(false);
      }
    } else {
      setIsEditUploadingR2(true);
      setUploadEditErrorR2(null);
      setUploadEditSuccessR2(false);
      try {
        const res = await uploadImage(file);
        setEditImageUrl(res.url);
        setUploadEditSuccessR2(true);
      } catch (err: unknown) {
        setUploadEditErrorR2(
          err instanceof Error
            ? err.message
            : "Failed to upload image to Cloudflare R2",
        );
      } finally {
        setIsEditUploadingR2(false);
      }
    }
  };

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setActionLoading(true);

    try {
      const created = await createBanner({
        title: newTitle,
        titleKh: newTitleKh.trim() || undefined,
        imageUrl: newImageUrl,
        linkUrl: newLinkUrl || undefined,
        order: Number(newOrder),
        isActive: true,
      });
      setBanners((prev) =>
        [...prev, created].sort((a, b) => a.order - b.order),
      );
      setShowAddModal(false);
      setNewTitle("");
      setNewTitleKh("");
      setNewImageUrl("");
      setNewLinkUrl("");
      setNewOrder(banners.length + 1);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Failed to create banner",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setEditTitle(banner.title);
    setEditTitleKh(banner.titleKh || "");
    setEditImageUrl(banner.imageUrl);
    setEditLinkUrl(banner.linkUrl || "");
    setEditOrder(banner.order);
    setEditIsActive(banner.isActive);
    setEditFormError(null);
  };

  const handleCloseEditModal = () => {
    setEditingBanner(null);
    setEditFormError(null);
  };

  const handleUpdateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner) return;
    setEditFormError(null);
    setActionLoading(true);

    try {
      const updated = await updateBanner(editingBanner.id, {
        title: editTitle,
        titleKh: editTitleKh.trim() || null,
        imageUrl: editImageUrl,
        linkUrl: editLinkUrl || undefined,
        order: Number(editOrder),
        isActive: editIsActive,
      });

      setBanners((prev) =>
        prev
          .map((b) => (b.id === editingBanner.id ? updated : b))
          .sort((a, b) => a.order - b.order),
      );
      handleCloseEditModal();
    } catch (err: unknown) {
      setEditFormError(
        err instanceof Error ? err.message : "Failed to update banner",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => {
    clearStoredAdmin();
    router.replace("/admin/login");
  };

  if (!admin) {
    return (
      <div className="min-h-screen bg-[#07080d] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  // Filtered banners
  const filteredBanners = banners.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.linkUrl &&
        b.linkUrl.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? b.isActive
          : !b.isActive;
    return matchesSearch && matchesStatus;
  });

  const activeCount = banners.filter((b) => b.isActive).length;

  // Filtered games
  const filteredGames = gamesList.filter((g) => {
    const q = gameSearchQuery.toLowerCase();
    const matchesSearch =
      g.name.toLowerCase().includes(q) ||
      g.slug.toLowerCase().includes(q) ||
      (g.category && g.category.toLowerCase().includes(q)) ||
      (g.providerCategoryId && g.providerCategoryId.toLowerCase().includes(q));
    const matchesStatus =
      gameStatusFilter === "all"
        ? true
        : gameStatusFilter === "active"
          ? g.isActive
          : !g.isActive;
    return matchesSearch && matchesStatus;
  });

  const activeGamesCount = gamesList.filter((g) => g.isActive).length;

  // Filtered gift cards
  const filteredGiftCards = giftCardsList.filter((gc) => {
    const q = giftCardSearchQuery.toLowerCase();
    const matchesSearch =
      (gc.name || "").toLowerCase().includes(q) ||
      (gc.slug || "").toLowerCase().includes(q) ||
      (gc.category || "").toLowerCase().includes(q) ||
      (gc.brand || "").toLowerCase().includes(q) ||
      (gc.description || "").toLowerCase().includes(q);
    const matchesStatus =
      giftCardStatusFilter === "all"
        ? true
        : giftCardStatusFilter === "active"
          ? gc.isActive
          : !gc.isActive;
    return matchesSearch && matchesStatus;
  });

  const activeGiftCardsCount = giftCardsList.filter((gc) => gc.isActive).length;

  return (
    <div className="min-h-screen bg-[#07080f] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white pb-safe-nav md:pb-8">
      {/* ========================================================================= */}
      {/* HAMBURGER SIDEBAR NAVIGATION DRAWER (Slide-out menu)                      */}
      {/* ========================================================================= */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Sliding Panel */}
          <div className="relative w-full max-w-xs bg-[#0b0a1a] border-r border-white/10 shadow-2xl p-6 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#141033] border border-white/10 p-1 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
                    <img
                      src="/logo.webp"
                      alt="The Coin Store Logo"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                  <div>
                    <span className="font-black text-sm text-white block leading-tight">
                      THE COIN STORE
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-purple-400 font-bold">
                      Admin Hub
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="mt-6 space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-2 font-mono">
                    Core Workspace
                  </span>
                  <nav className="space-y-1.5">
                    <button
                      onClick={() => {
                        setAdminView("sales");
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        adminView === "sales"
                          ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-600/30"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-4 h-4" />
                        <span>Sales Dashboard</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10">
                        Home
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setAdminView("banners");
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        adminView === "banners"
                          ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-600/30"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ImageIcon className="w-4 h-4" />
                        <span>Banner Control</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                        {banners.length}
                      </span>
                    </button>
                  </nav>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-2 font-mono">
                    Product Catalogs
                  </span>
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setAdminView("games");
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        adminView === "games"
                          ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-600/30"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Gamepad2 className="w-4 h-4 text-purple-400" />
                        <span>Game Diamonds</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono">
                        {gamesList.length}
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setAdminView("gift-cards");
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        adminView === "gift-cards"
                          ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-600/30"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-4 h-4 text-pink-400" />
                        <span>Gift Cards</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-mono">
                        {giftCardsList.length}
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between px-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      Provider Reseller Account
                    </span>
                    <button
                      onClick={loadProfile}
                      disabled={profileLoading}
                      className="text-[10px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
                      title="Sync provider balance"
                    >
                      <RefreshCw
                        className={`w-3 h-3 ${profileLoading ? "animate-spin text-purple-400" : ""}`}
                      />
                      <span>Sync</span>
                    </button>
                  </div>
                  <div className="px-3.5 py-3 rounded-2xl bg-gradient-to-br from-purple-950/30 via-white/[0.02] to-emerald-950/20 border border-purple-500/20 space-y-2.5 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-mono">
                          Reseller Partner
                        </span>
                        <span className="text-white font-bold text-xs block">
                          {providerProfile?.name || "KAS Reseller"}
                        </span>
                        {providerProfile?.email && (
                          <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[180px]">
                            {providerProfile.email}
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                        {providerProfile?.tier?.name || "Growth"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-emerald-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                        <span className="text-slate-300 text-[11px]">
                          Wholesale Balance
                        </span>
                      </div>
                      <span className="text-sm font-black text-emerald-400 font-mono">
                        ${Number(providerProfile?.balanceUsd ?? 0).toFixed(2)}{" "}
                        USD
                      </span>
                    </div>

                    {providerProfile?.tier?.discountLabel && (
                      <div className="text-[10px] text-purple-300/80 italic leading-tight">
                        {providerProfile.tier.discountLabel}
                      </div>
                    )}

                    {providerProfile?.apiKey && (
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="flex items-center gap-1">
                          <Key className="w-3 h-3 text-amber-400" />
                          {providerProfile.apiKey.keyPrefix}
                        </span>
                        <span className="text-slate-500">
                          {providerProfile.apiKey.rateLimitPerMin} req/m
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 block mb-2 font-mono">
                    Storage & Cloudflare Edge
                  </span>
                  <div className="px-3.5 py-3 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">R2 Bucket</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        the-coin-store
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">D1 SQLite</span>
                      <span className="text-purple-300 font-mono text-[11px]">
                        the_coin_dev (12ms)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-5 border-t border-white/10 space-y-2.5">
              <Link
                href="/"
                target="_blank"
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition-colors"
              >
                <Store className="w-4 h-4 text-purple-400" />
                Live Customer Store
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-semibold text-red-400 flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DESKTOP HEADER (`hidden md:flex`)                                      */}
      {/* ========================================================================= */}
      <header className="hidden md:block sticky top-0 z-40 bg-[#0e111a]/90 backdrop-blur-xl border-b border-white/10 px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Hamburger Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white flex items-center gap-2 transition-all active:scale-95 group shadow-sm"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold tracking-wide">Menu</span>
            </button>

            <div className="w-10 h-10 rounded-2xl bg-[#141033] border border-white/10 p-1 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
              <img
                src="/logo.webp"
                alt="The Coin Store Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base">
                  The Coin Store Admin
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  {admin.role}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {admin.email}
              </span>
            </div>
          </div>

          {/* Desktop Center View Switcher */}
          <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setAdminView("sales")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                adminView === "sales"
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Sales</span>
            </button>
            <button
              onClick={() => setAdminView("games")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                adminView === "games"
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>Games ({gamesList.length})</span>
            </button>
            <button
              onClick={() => setAdminView("gift-cards")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                adminView === "gift-cards"
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Gift Cards ({giftCardsList.length})</span>
            </button>
            <button
              onClick={() => setAdminView("banners")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                adminView === "banners"
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Banners ({banners.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Provider Wholesale Balance Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-purple-950/20 to-slate-900 border border-emerald-500/30 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Wallet className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Wholesale Balance
                  </span>
                  {providerProfile?.tier?.name && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                      {providerProfile.tier.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-emerald-400 font-mono leading-tight">
                    {profileLoading && !providerProfile ? (
                      <span className="text-xs text-slate-400">Syncing...</span>
                    ) : (
                      `$${Number(providerProfile?.balanceUsd ?? 0).toFixed(2)} USD`
                    )}
                  </span>
                  <button
                    onClick={loadProfile}
                    disabled={profileLoading}
                    title="Refresh Provider Reseller Balance"
                    className="p-1 rounded-md text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${profileLoading ? "animate-spin text-emerald-400" : ""}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <Link
              href="/"
              target="_blank"
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-2 transition-colors"
            >
              <Store className="w-4 h-4 text-purple-400" />
              Live Storefront
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-semibold text-red-400 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MOBILE NATIVE APP HEADER (`flex md:hidden`)                            */}
      {/* ========================================================================= */}
      <header className="md:hidden sticky top-0 z-40 pt-safe bg-[#0d0a27]/95 backdrop-blur-xl border-b border-white/10 px-4 pb-3">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2.5">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-purple-300 active:scale-95"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="w-9 h-9 rounded-xl bg-[#141033] border border-white/10 p-1 flex items-center justify-center shadow-lg shadow-purple-500/20 shrink-0">
              <img
                src="/logo.webp"
                alt="The Coin Store Logo"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div>
              <h1 className="font-black text-sm text-white leading-tight">
                {adminView === "sales"
                  ? "Sales Overview"
                  : adminView === "games"
                    ? "Game Diamonds"
                    : adminView === "gift-cards"
                      ? "Gift Cards"
                      : "Banner Control"}
              </h1>
              <span className="text-[10px] text-purple-300 block font-mono leading-none">
                Reseller Control
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={
                adminView === "games"
                  ? loadGames
                  : adminView === "gift-cards"
                    ? loadGiftCards
                    : loadBanners
              }
              disabled={
                loading || gamesLoading || giftCardsLoading || actionLoading
              }
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 active:scale-95 transition-all"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  loading || gamesLoading || giftCardsLoading
                    ? "animate-spin text-purple-400"
                    : ""
                }`}
              />
            </button>
            {adminView === "games" && (
              <button
                onClick={handleSyncGames}
                disabled={syncingGames || actionLoading}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 active:scale-95 transition-all"
                title="Sync from Provider"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${syncingGames ? "animate-spin" : ""}`}
                />
                <span>Sync</span>
              </button>
            )}
            {adminView === "gift-cards" && (
              <button
                onClick={handleSyncGiftCards}
                disabled={syncingGiftCards || actionLoading}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 active:scale-95 transition-all"
                title="Sync Gift Cards from Provider"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${syncingGiftCards ? "animate-spin" : ""}`}
                />
                <span>Sync</span>
              </button>
            )}
            {adminView === "banners" && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Reseller Balance Quick Bar */}
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-950/40 via-purple-950/30 to-[#0e0c24] border border-emerald-500/25 mt-2">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet className="w-3 h-3" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-300">Balance:</span>
              <span className="text-xs font-black text-emerald-400 font-mono">
                {profileLoading && !providerProfile ? (
                  <span className="text-[10px] text-slate-400">Syncing...</span>
                ) : (
                  `$${Number(providerProfile?.balanceUsd ?? 0).toFixed(2)} USD`
                )}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {providerProfile?.tier?.name && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {providerProfile.tier.name}
              </span>
            )}
            <button
              onClick={loadProfile}
              disabled={profileLoading}
              className="p-1 rounded text-slate-400 hover:text-emerald-400 transition-colors"
              title="Refresh Provider Balance"
            >
              <RefreshCw
                className={`w-3 h-3 ${profileLoading ? "animate-spin text-emerald-400" : ""}`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT CONTAINER (Responsive for Desktop & Mobile)               */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* ======================================================================= */}
        {/* 1. SALES DASHBOARD VIEW (Shown when adminView === 'sales')              */}
        {/* ======================================================================= */}
        {adminView === "sales" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Hero Sales Overview Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950/70 via-[#130f2c] to-[#0c0a1a] border border-purple-500/20 p-6 md:p-8 shadow-2xl">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-[11px] font-bold text-purple-300 mb-3">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Reseller Telemetry Engine Active</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    Sales & Operations Dashboard
                  </h2>
                  <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-xl">
                    Live monitoring of digital diamond reloads, payment
                    processing, and promotional campaign distribution.
                  </p>
                </div>

                <button
                  onClick={() => setAdminView("banners")}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-95 text-white font-bold text-xs flex items-center gap-2 shadow-xl shadow-purple-600/30 transition-all active:scale-98"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Manage Store Banners ({banners.length})</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Provider Reseller Live Telemetry Card */}
            <div className="rounded-3xl bg-gradient-to-br from-[#120f2e] via-[#0d1024] to-[#070b16] border border-emerald-500/20 p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/10 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-bold text-emerald-300 inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Live Reseller Account
                    </span>
                    {providerProfile?.tier?.name && (
                      <span className="px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-xs font-bold text-purple-300 uppercase tracking-wider">
                        Tier: {providerProfile.tier.name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>
                      {providerProfile?.name || "KAS Reseller Partner"}
                    </span>
                    <span className="text-xs font-mono font-normal text-slate-400">
                      (
                      {providerProfile?.email ||
                        "tg_581867300@kasplay.kascambodia.com"}
                      )
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 font-medium max-w-xl">
                    {providerProfile?.tier?.discountLabel ||
                      "Extended Wholesale Discounts on Every Sale"}
                  </p>
                  {providerProfile?.userId && (
                    <div className="text-[11px] text-slate-500 font-mono">
                      Partner ID:{" "}
                      <span className="text-slate-400">
                        {providerProfile.userId}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-black/40 border border-white/10 p-4 rounded-2xl">
                  <div className="space-y-0.5">
                    <span className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
                      Wholesale Balance
                    </span>
                    <div className="text-3xl font-black text-emerald-400 font-mono">
                      {profileLoading && !providerProfile ? (
                        <span className="text-base text-slate-400">
                          Syncing...
                        </span>
                      ) : (
                        `$${Number(providerProfile?.balanceUsd ?? 0).toFixed(2)} USD`
                      )}
                    </div>
                    {providerProfile?.apiKey && (
                      <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                        <span className="text-amber-400 flex items-center gap-1">
                          <Key className="w-3 h-3" />
                          {providerProfile.apiKey.name}:{" "}
                          {providerProfile.apiKey.keyPrefix}
                        </span>
                        <span>•</span>
                        <span>
                          {providerProfile.apiKey.rateLimitPerMin} req/m
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={loadProfile}
                    disabled={profileLoading}
                    className="px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ml-auto"
                    title="Refresh Reseller Balance"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${profileLoading ? "animate-spin text-emerald-400" : ""}`}
                    />
                    <span>Sync Balance</span>
                  </button>
                </div>
              </div>
            </div>

            {/* KPI Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              <div className="rounded-2xl bg-[#0e111a] border border-emerald-500/20 p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Wholesale Balance
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Wallet className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  ${Number(providerProfile?.balanceUsd ?? 0).toFixed(2)}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Wholesale API Connected</span>
                </div>
              </div>

              <div className="rounded-2xl bg-[#0e111a] border border-white/10 p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Reload Orders
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  1,280 Orders
                </div>
                <div className="flex items-center gap-1 text-[11px] text-purple-300 mt-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Instant auto-fulfillment</span>
                </div>
              </div>

              <div className="rounded-2xl bg-[#0e111a] border border-white/10 p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Active Promos
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-white">
                  {activeCount}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    / {banners.length} total
                  </span>
                </div>
                <button
                  onClick={() => setAdminView("banners")}
                  className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold mt-1 inline-flex items-center gap-1"
                >
                  <span>Open banner editor</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>

              <div className="rounded-2xl bg-[#0e111a] border border-white/10 p-5 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                    Provider Gateway
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Server className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-sm font-black text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {providerProfile?.tier?.name || "Growth"} Tier Live
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono flex items-center justify-between">
                  <span>
                    {providerProfile?.apiKey?.keyPrefix || "kp_live_..."}
                  </span>
                  <span className="text-slate-500">
                    {providerProfile?.apiKey?.rateLimitPerMin || 60} req/m
                  </span>
                </div>
              </div>
            </div>

            {/* Live Top-Up Stream */}
            <div className="rounded-3xl bg-[#0e111a] border border-white/10 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400" />
                    Live Top-Up Transaction Feed
                  </h3>
                  <p className="text-xs text-slate-400">
                    Recent diamond deliveries handled through the reseller
                    gateway
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-bold text-emerald-300">
                  Bakong KHQR Active
                </span>
              </div>

              <div className="divide-y divide-white/5 text-xs">
                {[
                  {
                    id: "ORD-9921",
                    game: "Mobile Legends",
                    item: "514 Diamonds",
                    user: "ML-789212 (2091)",
                    price: "$9.50",
                    time: "2 min ago",
                    status: "Completed",
                  },
                  {
                    id: "ORD-9920",
                    game: "Free Fire",
                    item: "1,080 Diamonds",
                    user: "FF-89912041",
                    price: "$10.00",
                    time: "5 min ago",
                    status: "Completed",
                  },
                  {
                    id: "ORD-9919",
                    game: "PUBG Mobile",
                    item: "660 UC",
                    user: "PUBG-5192831",
                    price: "$9.99",
                    time: "11 min ago",
                    status: "Completed",
                  },
                  {
                    id: "ORD-9918",
                    game: "Steam Wallet",
                    item: "$10 USD Code",
                    user: "customer@gmail.com",
                    price: "$10.00",
                    time: "18 min ago",
                    status: "Delivered",
                  },
                ].map((t) => (
                  <div
                    key={t.id}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-mono text-[10px] text-slate-300">
                        {t.id.split("-")[1]}
                      </div>
                      <div>
                        <span className="font-bold text-white block">
                          {t.game}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {t.item} • {t.user}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-white block">
                        {t.price}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold">
                        {t.status} • {t.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* 2. BANNER MANAGEMENT SECTION (Shown when adminView === 'banners')       */}
        {/* ======================================================================= */}
        {adminView === "banners" && (
          <section className="space-y-4">
            {/* Header & Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-purple-400" />
                  Home Page Banners
                </h2>
                <p className="text-xs text-slate-400">
                  Manage promotional hero carousel banners served via{" "}
                  <code className="text-purple-300 font-mono">
                    /api/banners
                  </code>
                </p>
              </div>

              {/* Desktop Action Buttons */}
              <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={loadBanners}
                  disabled={loading || actionLoading}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
                  title="Refresh banners"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`}
                  />
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs hover:opacity-95 transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Banner
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0e111a] border border-white/10 rounded-2xl p-2.5">
              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by title or link..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === "all"
                      ? "bg-purple-600 text-white shadow"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  All ({banners.length})
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === "active"
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  Active ({activeCount})
                </button>
                <button
                  onClick={() => setStatusFilter("inactive")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === "inactive"
                      ? "bg-red-600 text-white shadow"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  Inactive ({banners.length - activeCount})
                </button>
              </div>
            </div>

            {/* Banners List / Grid */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
                <p className="text-xs">Loading banners from API...</p>
              </div>
            ) : filteredBanners.length === 0 ? (
              <div className="rounded-3xl bg-[#0e111a] border border-white/10 p-10 text-center">
                <ImageIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h3 className="font-bold text-white text-sm">
                  No Banners Match Criteria
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  Adjust your search query or add a new promotional banner.
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Banner
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredBanners.map((banner) => (
                  <div
                    key={banner.id}
                    className={`rounded-2xl bg-[#0e111a] border transition-all overflow-hidden flex flex-col justify-between shadow-xl ${
                      banner.isActive
                        ? "border-white/10 hover:border-purple-500/50"
                        : "border-white/5 opacity-65"
                    }`}
                  >
                    <div>
                      {/* Image Preview */}
                      <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
                        <img
                          src={banner.imageUrl}
                          alt={banner.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10">
                          #{banner.order}
                        </div>
                        <div className="absolute top-2 right-2">
                          {banner.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 backdrop-blur-md">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] font-bold text-red-300 backdrop-blur-md">
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-bold text-white text-sm mb-1 line-clamp-1">
                          {banner.title}
                        </h3>
                        {banner.linkUrl ? (
                          <div className="flex items-center gap-1 text-[11px] text-purple-300 truncate">
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{banner.linkUrl}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500">
                            No redirect URL
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Bar (Touch and Click Friendly) */}
                    <div className="p-4 pt-0 border-t border-white/5 flex items-center justify-between gap-2 mt-2">
                      <button
                        onClick={() => handleToggleStatus(banner)}
                        disabled={actionLoading}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all active:scale-98 ${
                          banner.isActive
                            ? "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                            : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40"
                        }`}
                      >
                        {banner.isActive ? "Turn Off" : "Set Active"}
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(banner)}
                        disabled={actionLoading}
                        className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 active:scale-95 transition-all"
                        title="Edit banner details"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        disabled={actionLoading}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 active:scale-95 transition-all"
                        title="Delete banner"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ======================================================================= */}
        {/* 3. GAME DIAMONDS CATALOG SECTION (Shown when adminView === 'games')     */}
        {/* ======================================================================= */}
        {adminView === "games" && (
          <section className="space-y-5 animate-in fade-in duration-300">
            {/* Sync Notification Toast */}
            {syncNotice && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between gap-3 shadow-lg shadow-emerald-500/10 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{syncNotice}</span>
                </div>
                <button
                  onClick={() => setSyncNotice(null)}
                  className="text-emerald-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Header & Sync Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-purple-400" />
                    Game Diamonds Catalog
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30 font-mono">
                    {gamesList.length} Games
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Synced directly with KAS Provider. Customize names and upload
                  your own Cloudflare R2 artwork.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={loadGames}
                  disabled={gamesLoading || syncingGames || actionLoading}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
                  title="Refresh games list"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${gamesLoading ? "animate-spin text-purple-400" : ""}`}
                  />
                </button>

                <button
                  onClick={handleSyncGames}
                  disabled={syncingGames || actionLoading}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${syncingGames ? "animate-spin" : ""}`}
                  />
                  <span>
                    {syncingGames
                      ? "Syncing from Provider..."
                      : "Sync from Provider"}
                  </span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0e111a] border border-white/10 rounded-2xl p-2.5">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter games by title, slug, category..."
                  value={gameSearchQuery}
                  onChange={(e) => setGameSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                <button
                  onClick={() => setGameStatusFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    gameStatusFilter === "all"
                      ? "bg-purple-600 text-white shadow"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  All ({gamesList.length})
                </button>
                <button
                  onClick={() => setGameStatusFilter("active")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    gameStatusFilter === "active"
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  Active ({activeGamesCount})
                </button>
                <button
                  onClick={() => setGameStatusFilter("inactive")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    gameStatusFilter === "inactive"
                      ? "bg-red-600 text-white shadow"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  Inactive ({gamesList.length - activeGamesCount})
                </button>
              </div>
            </div>

            {/* Games Grid */}
            {gamesLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
                <p className="text-xs">Loading games from database...</p>
              </div>
            ) : filteredGames.length === 0 ? (
              <div className="rounded-3xl bg-[#0e111a] border border-white/10 p-10 text-center">
                <Gamepad2 className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h3 className="font-bold text-white text-sm">
                  {gamesList.length === 0
                    ? "No Games Synced Yet"
                    : "No Games Match Filter Criteria"}
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  {gamesList.length === 0
                    ? "Click 'Sync from Provider' to automatically import game catalogs from KAS Reseller API."
                    : "Try adjusting your search query or reset status filters."}
                </p>
                {gamesList.length === 0 && (
                  <button
                    onClick={handleSyncGames}
                    disabled={syncingGames}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-purple-600/30"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${syncingGames ? "animate-spin" : ""}`}
                    />
                    <span>Sync from Provider</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {filteredGames.map((game) => (
                  <div
                    key={game.id}
                    className={`rounded-2xl bg-[#0e111a] border transition-all overflow-hidden flex flex-col justify-between shadow-xl ${
                      game.isActive
                        ? "border-white/10 hover:border-purple-500/50"
                        : "border-white/5 opacity-60"
                    }`}
                  >
                    <div>
                      {/* Game Image Thumbnail */}
                      <div className="relative aspect-[4/3] w-full bg-slate-950 overflow-hidden group">
                        <img
                          src={game.imageUrl}
                          alt={game.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Order & Custom Image Badge */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10 self-start">
                            #{game.order}
                          </span>
                          {game.isCustomImage ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-bold text-emerald-300 backdrop-blur-md">
                              Custom R2 Cover
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-[9px] font-medium text-slate-400 backdrop-blur-md">
                              Provider Art
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          {game.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 backdrop-blur-md">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] font-bold text-red-300 backdrop-blur-md">
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
                        </div>

                        {/* Bottom Overlay: Packages & Validation */}
                        <div className="absolute bottom-2 inset-x-2 flex items-center justify-between gap-1 text-[10px]">
                          {game.canValidate ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold backdrop-blur-md">
                              ✓ Auto Validate
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-slate-400 backdrop-blur-md">
                              Direct Top-Up
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-300 font-bold backdrop-blur-md font-mono">
                            {game.packageCount ?? 0} Packages
                          </span>
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-4 space-y-2">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-white text-sm line-clamp-1">
                              {game.name}
                            </h3>
                            {game.isCustomName && (
                              <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 flex-shrink-0">
                                Custom
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                            {game.slug}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px]">
                            {game.category || "MOBA"}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {game.hasZoneId ? "UID + Zone" : "UID only"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="p-4 pt-0 border-t border-white/5 flex items-center justify-between gap-2 mt-2">
                      <button
                        onClick={() => handleToggleGameStatus(game)}
                        disabled={actionLoading}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all active:scale-98 ${
                          game.isActive
                            ? "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                            : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40"
                        }`}
                      >
                        {game.isActive ? "Turn Off" : "Set Active"}
                      </button>

                      <Link
                        href={`/admin/games/${game.id}`}
                        className="px-3 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold"
                        title="Edit game in full page editor"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ======================================================================= */}
        {/* 4. GIFT CARDS VIEW (Shown when adminView === 'gift-cards')              */}
        {/* ======================================================================= */}
        {adminView === "gift-cards" && (
          <section className="space-y-5 animate-in fade-in duration-300">
            {/* Sync Notification Banner */}
            {gcSyncNotice && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{gcSyncNotice}</span>
                </div>
                <button
                  onClick={() => setGcSyncNotice(null)}
                  className="text-emerald-400 hover:text-white text-xs px-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Header / Actions Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2.5">
                  <CreditCard className="w-6 h-6 text-pink-400" />
                  <span>Digital Gift Cards Catalog</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-pink-300 font-mono">
                    {giftCardsList.length} Cards
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Manage digital vouchers, steam codes, and gaming gift cards
                  synced from the provider. Custom names, descriptions, and
                  uploaded R2 cover art are permanently preserved.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadGiftCards}
                  disabled={giftCardsLoading || actionLoading}
                  className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-xs"
                  title="Reload from local database"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${giftCardsLoading ? "animate-spin text-purple-400" : ""}`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  onClick={handleSyncGiftCards}
                  disabled={syncingGiftCards || actionLoading}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 hover:opacity-95 transition-opacity active:scale-95 disabled:opacity-50"
                  title="Sync live gift cards from KAS Reseller API"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${syncingGiftCards ? "animate-spin" : ""}`}
                  />
                  <span>
                    {syncingGiftCards
                      ? "Syncing Cards..."
                      : "Sync from Provider"}
                  </span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0e111a] border border-white/10 rounded-2xl p-2.5">
              <div className="relative w-full sm:w-80">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter gift cards by title, brand, category..."
                  value={giftCardSearchQuery}
                  onChange={(e) => setGiftCardSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                <button
                  onClick={() => setGiftCardStatusFilter("all")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    giftCardStatusFilter === "all"
                      ? "bg-purple-600 text-white shadow"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  All ({giftCardsList.length})
                </button>
                <button
                  onClick={() => setGiftCardStatusFilter("active")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    giftCardStatusFilter === "active"
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  Active ({activeGiftCardsCount})
                </button>
                <button
                  onClick={() => setGiftCardStatusFilter("inactive")}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    giftCardStatusFilter === "inactive"
                      ? "bg-red-600 text-white shadow"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  Inactive ({giftCardsList.length - activeGiftCardsCount})
                </button>
              </div>
            </div>

            {/* Gift Cards Grid */}
            {giftCardsLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-3" />
                <p className="text-xs">Loading gift cards from database...</p>
              </div>
            ) : filteredGiftCards.length === 0 ? (
              <div className="rounded-3xl bg-[#0e111a] border border-white/10 p-10 text-center">
                <CreditCard className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                <h3 className="font-bold text-white text-sm">
                  {giftCardsList.length === 0
                    ? "No Gift Cards Synced Yet"
                    : "No Gift Cards Match Filter Criteria"}
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">
                  {giftCardsList.length === 0
                    ? "Click 'Sync from Provider' to automatically import gift cards from KAS Reseller API."
                    : "Try adjusting your search query or reset status filters."}
                </p>
                {giftCardsList.length === 0 && (
                  <button
                    onClick={handleSyncGiftCards}
                    disabled={syncingGiftCards}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-purple-600/30"
                  >
                    <RefreshCw
                      className={`w-3.5 h-3.5 ${syncingGiftCards ? "animate-spin" : ""}`}
                    />
                    <span>Sync from Provider</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {filteredGiftCards.map((gc) => (
                  <div
                    key={gc.id}
                    className={`rounded-2xl bg-[#0e111a] border transition-all overflow-hidden flex flex-col justify-between shadow-xl ${
                      gc.isActive
                        ? "border-white/10 hover:border-pink-500/50"
                        : "border-white/5 opacity-60"
                    }`}
                  >
                    <div>
                      {/* Gift Card Artwork Thumbnail */}
                      <div className="relative aspect-[16/10] w-full bg-slate-950 overflow-hidden group">
                        <img
                          src={gc.imageUrl}
                          alt={gc.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Order & Custom Image Badge */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-white/10 self-start">
                            #{gc.order}
                          </span>
                          {gc.isCustomImage ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-bold text-emerald-300 backdrop-blur-md">
                              Custom R2 Cover
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-black/60 border border-white/10 text-[9px] font-medium text-slate-400 backdrop-blur-md">
                              Provider Art
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          {gc.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 backdrop-blur-md">
                              <CheckCircle className="w-3 h-3" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/40 text-[10px] font-bold text-red-300 backdrop-blur-md">
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </span>
                          )}
                        </div>

                        {/* Category badge */}
                        <div className="absolute bottom-2 left-2">
                          <span className="px-2 py-0.5 rounded-md bg-purple-900/80 backdrop-blur-md border border-purple-500/30 text-[10px] font-bold text-purple-200">
                            {gc.category}
                          </span>
                        </div>
                      </div>

                      {/* Content Info */}
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 font-mono">
                            {gc.brand || "Digital Voucher"}
                          </span>
                          {gc.isCustomName && (
                            <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                              Renamed
                            </span>
                          )}
                        </div>

                        <h3 className="font-extrabold text-white text-sm line-clamp-1 group-hover:text-pink-300 transition-colors">
                          {gc.name}
                        </h3>

                        {gc.description && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed whitespace-pre-line">
                            {gc.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="p-4 pt-0 flex items-center gap-2">
                      <button
                        onClick={() => handleToggleGiftCardStatus(gc)}
                        disabled={actionLoading}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all active:scale-98 ${
                          gc.isActive
                            ? "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                            : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40"
                        }`}
                      >
                        {gc.isActive ? "Turn Off" : "Set Active"}
                      </button>

                      <Link
                        href={`/admin/gift-cards/${gc.id}`}
                        className="px-3 py-2 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 text-pink-300 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold"
                        title="Edit gift card on dedicated page"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* ========================================================================= */}
      {/* 4. MOBILE NATIVE BOTTOM NAVIGATION BAR (`md:hidden`)                      */}
      {/* ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#0a081e]/95 backdrop-blur-2xl border-t border-white/10 shadow-2xl">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Sales Tab */}
          <button
            onClick={() => setAdminView("sales")}
            className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-colors ${
              adminView === "sales"
                ? "text-purple-400 font-bold"
                : "text-slate-400"
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px]">Sales</span>
          </button>

          {/* Games Tab */}
          <button
            onClick={() => setAdminView("games")}
            className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-colors ${
              adminView === "games"
                ? "text-purple-400 font-bold"
                : "text-slate-400"
            }`}
          >
            <Gamepad2 className="w-5 h-5" />
            <span className="text-[10px]">Games</span>
          </button>

          {/* Gift Cards Tab */}
          <button
            onClick={() => setAdminView("gift-cards")}
            className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-colors ${
              adminView === "gift-cards"
                ? "text-purple-400 font-bold"
                : "text-slate-400"
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[10px]">Gift Cards</span>
          </button>

          {/* Banners Tab */}
          <button
            onClick={() => setAdminView("banners")}
            className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-colors ${
              adminView === "banners"
                ? "text-purple-400 font-bold"
                : "text-slate-400"
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-[10px]">Banners</span>
          </button>

          {/* Live Storefront Link */}
          <Link
            href="/"
            target="_blank"
            className="flex flex-col items-center justify-center flex-1 py-1 gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <Store className="w-5 h-5" />
            <span className="text-[10px]">Store</span>
          </Link>

          {/* Sign Out */}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center justify-center flex-1 py-1 gap-1 text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px]">Logout</span>
          </button>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 5. ADD BANNER MODAL (Responsive Desktop Centered & Mobile Bottom-Sheet)   */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0e111a] border border-white/10 rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Mobile Drag Handle Bar */}
            <div className="sm:hidden w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-4" />

            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <h3 className="font-bold text-white text-base md:text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" />
                Add Promotional Banner
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateBanner} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Banner Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Free Fire Diamond Rush Event"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Banner Title (Khmer / ភាសាខ្មែរ)
                  </label>
                  <span className="text-[10px] text-pink-400 font-medium">
                    🇰🇭 Optional Khmer title
                  </span>
                </div>
                <input
                  type="text"
                  value={newTitleKh}
                  onChange={(e) => setNewTitleKh(e.target.value)}
                  placeholder="e.g. មហាព្រឹត្តិការណ៍ពេជ្រ Free Fire"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Banner Image *
                </label>

                {/* Cloudflare R2 Upload Dropzone */}
                <div className="relative border-2 border-dashed border-white/15 hover:border-purple-500/50 rounded-2xl p-4 bg-white/[0.02] text-center transition-all mb-3">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "new");
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    disabled={isUploadingR2}
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    {isUploadingR2 ? (
                      <>
                        <Loader2 className="w-7 h-7 text-purple-400 animate-spin mb-2" />
                        <span className="text-xs font-bold text-white">
                          Uploading image to Cloudflare R2...
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Storing in R2 bucket
                        </span>
                      </>
                    ) : uploadSuccessR2 ? (
                      <>
                        <CheckCircle className="w-7 h-7 text-emerald-400 mb-1.5" />
                        <span className="text-xs font-bold text-emerald-300">
                          Successfully Uploaded to R2!
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Click or drag another image to replace
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-2">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-white">
                          Upload image to Cloudflare R2
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          Drag & drop or browse device (PNG, JPG, WEBP, GIF)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {uploadErrorR2 && (
                  <p className="mb-2 text-[11px] text-red-400">
                    {uploadErrorR2}
                  </p>
                )}

                {/* Direct Image URL fallback or edit */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Or image URL:</span>
                    {uploadSuccessR2 && (
                      <span className="text-emerald-400 font-mono text-[10px]">
                        ✓ R2 Hosted
                      </span>
                    )}
                  </div>
                  <input
                    type="url"
                    required
                    value={newImageUrl}
                    onChange={(e) => {
                      setNewImageUrl(e.target.value);
                      setUploadSuccessR2(false);
                    }}
                    placeholder="https://... or uploaded R2 URL"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>

                {newImageUrl && (
                  <div className="mt-2.5 relative aspect-[16/9] w-full rounded-xl bg-black/60 border border-white/10 overflow-hidden shadow-inner">
                    <img
                      src={newImageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] text-slate-300">
                      Live Image Preview
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Target Route / Link
                  </label>
                  <input
                    type="text"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="/games/free-fire"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newOrder}
                    onChange={(e) => setNewOrder(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Publish Banner"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. EDIT BANNER MODAL (Responsive Desktop Centered & Mobile Bottom-Sheet)  */}
      {/* ========================================================================= */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#0e111a] border border-white/10 rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Mobile Drag Handle Bar */}
            <div className="sm:hidden w-12 h-1.5 rounded-full bg-white/20 mx-auto mb-4" />

            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div>
                <h3 className="font-bold text-white text-base md:text-lg flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-purple-400" />
                  Edit Promotional Banner
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  ID: {editingBanner.id}
                </span>
              </div>
              <button
                onClick={handleCloseEditModal}
                className="text-slate-400 hover:text-white text-sm p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {editFormError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {editFormError}
              </div>
            )}

            <form onSubmit={handleUpdateBanner} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Banner Title *
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Banner Title (Khmer / ភាសាខ្មែរ)
                  </label>
                  <span className="text-[10px] text-pink-400 font-medium">
                    🇰🇭 Shown when Khmer is selected
                  </span>
                </div>
                <input
                  type="text"
                  value={editTitleKh}
                  onChange={(e) => setEditTitleKh(e.target.value)}
                  placeholder="e.g. មហាព្រឹត្តិការណ៍ពេជ្រ Free Fire"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Banner Image *
                </label>

                {/* Cloudflare R2 Upload Dropzone */}
                <div className="relative border-2 border-dashed border-white/15 hover:border-purple-500/50 rounded-2xl p-4 bg-white/[0.02] text-center transition-all mb-3">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file, "edit");
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    disabled={isEditUploadingR2}
                  />
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    {isEditUploadingR2 ? (
                      <>
                        <Loader2 className="w-7 h-7 text-purple-400 animate-spin mb-2" />
                        <span className="text-xs font-bold text-white">
                          Uploading new image to Cloudflare R2...
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Replacing in R2 bucket
                        </span>
                      </>
                    ) : uploadEditSuccessR2 ? (
                      <>
                        <CheckCircle className="w-7 h-7 text-emerald-400 mb-1.5" />
                        <span className="text-xs font-bold text-emerald-300">
                          New Image Uploaded to R2!
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5">
                          Click or drag another image to replace
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-2">
                          <UploadCloud className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-white">
                          Upload new image to Cloudflare R2
                        </span>
                        <span className="text-[11px] text-slate-400 mt-0.5">
                          Drag & drop or browse device (PNG, JPG, WEBP, GIF)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {uploadEditErrorR2 && (
                  <p className="mb-2 text-[11px] text-red-400">
                    {uploadEditErrorR2}
                  </p>
                )}

                {/* Direct Image URL fallback or edit */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span>Or image URL:</span>
                    {uploadEditSuccessR2 && (
                      <span className="text-emerald-400 font-mono text-[10px]">
                        ✓ R2 Hosted
                      </span>
                    )}
                  </div>
                  <input
                    type="url"
                    required
                    value={editImageUrl}
                    onChange={(e) => {
                      setEditImageUrl(e.target.value);
                      setUploadEditSuccessR2(false);
                    }}
                    placeholder="https://... or uploaded R2 URL"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>

                {editImageUrl && (
                  <div className="mt-2.5 relative aspect-[16/9] w-full rounded-xl bg-black/60 border border-white/10 overflow-hidden shadow-inner">
                    <img
                      src={editImageUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLElement).style.display = "none";
                      }}
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] text-slate-300">
                      Live Image Preview
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Target Route / Link
                  </label>
                  <input
                    type="text"
                    value={editLinkUrl}
                    onChange={(e) => setEditLinkUrl(e.target.value)}
                    placeholder="/games/..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editOrder}
                    onChange={(e) => setEditOrder(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* Status Toggle Switch */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Banner Visibility
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    {editIsActive
                      ? "Active: shown in customer storefront carousel"
                      : "Inactive: hidden from customer storefront"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditIsActive((prev) => !prev)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    editIsActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-red-500/20 text-red-300 border border-red-500/40"
                  }`}
                >
                  {editIsActive ? "Active" : "Inactive"}
                </button>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
