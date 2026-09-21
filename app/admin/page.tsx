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
} from "lucide-react";
import {
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getStoredAdmin,
  clearStoredAdmin,
  verifyAdminSession,
  Banner,
  AdminUser,
} from "../../lib/api";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit banner state
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [editTitle, setEditTitle] = useState("");
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
    loadBanners();

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

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setActionLoading(true);

    try {
      const created = await createBanner({
        title: newTitle,
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

  return (
    <div className="min-h-screen bg-[#07080f] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white pb-safe-nav md:pb-8">
      {/* ========================================================================= */}
      {/* 1. DESKTOP HEADER (`hidden md:flex`)                                      */}
      {/* ========================================================================= */}
      <header className="hidden md:block sticky top-0 z-40 bg-[#0e111a]/90 backdrop-blur-xl border-b border-white/10 px-8 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Shield className="w-5 h-5" />
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

          <div className="flex items-center gap-3">
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
            <div className="w-9 h-9 rounded-xl bg-purple-600/25 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-black text-sm text-white leading-tight">
                Admin Portal
              </h1>
              <span className="text-[10px] text-purple-300 block font-mono leading-none">
                Reseller Control
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadBanners}
              disabled={loading || actionLoading}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 active:scale-95 transition-all"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}`}
              />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Mobile View Selector Chips */}
        <div className="flex items-center gap-2 mt-1 pt-2 border-t border-white/5">
          <button
            onClick={() => setMobileView("banners")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
              mobileView === "banners"
                ? "bg-purple-600 text-white shadow"
                : "bg-white/5 text-slate-400"
            }`}
          >
            Banners ({banners.length})
          </button>
          <button
            onClick={() => setMobileView("providers")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
              mobileView === "providers"
                ? "bg-purple-600 text-white shadow"
                : "bg-white/5 text-slate-400"
            }`}
          >
            Providers
          </button>
          <button
            onClick={() => setMobileView("overview")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${
              mobileView === "overview"
                ? "bg-purple-600 text-white shadow"
                : "bg-white/5 text-slate-400"
            }`}
          >
            Overview
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT CONTAINER (Responsive for Desktop & Mobile)               */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        {/* Desktop Overview Telemetry Cards (Or on Mobile when Overview is selected) */}
        <div
          className={`grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 ${
            mobileView === "overview" ? "grid" : "hidden md:grid"
          }`}
        >
          <div className="rounded-2xl bg-[#0e111a] border border-white/10 p-5 md:p-6 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wider font-medium">
                Active Banners
              </span>
              <span className="text-2xl md:text-3xl font-black text-white">
                {activeCount}{" "}
                <span className="text-sm font-normal text-slate-500">
                  / {banners.length} total
                </span>
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <ImageIcon className="w-5 h-5" />
            </div>
          </div>

          <div className="rounded-2xl bg-[#0e111a] border border-white/10 p-5 md:p-6 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wider font-medium">
                Reseller Service
              </span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                <Zap className="w-4 h-4 text-emerald-400" />
                API Gateway Ready
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                0.2s Dispatch Queue
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
          </div>

          <div className="rounded-2xl bg-[#0e111a] border border-white/10 p-5 md:p-6 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wider font-medium">
                Aggregator Pipeline
              </span>
              <span className="text-xs text-slate-300 font-semibold block mt-1">
                Automated Bot Dispatch
              </span>
              <span className="text-[10px] text-purple-300 font-mono">
                Provider Webhooks Active
              </span>
            </div>
            <div className="w-11 h-11 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Mobile Provider View (Shown when 'providers' is selected on mobile) */}
        {mobileView === "providers" && (
          <div className="md:hidden space-y-4">
            <div className="rounded-2xl bg-[#0e111a] border border-white/10 p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Server className="w-4 h-4 text-purple-400" />
                <span>Connected Reseller Providers</span>
              </div>
              <p className="text-xs text-slate-400">
                Backend is configured to dispatch incoming diamond reload orders
                directly to top-up aggregators.
              </p>
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status</span>
                  <span className="text-emerald-400 font-bold">
                    Online & Active
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Average Latency</span>
                  <span className="text-purple-300 font-mono">180ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Auto-Retry Failover</span>
                  <span className="text-slate-300 font-bold">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* BANNER MANAGEMENT SECTION (Default on Desktop, shown on Mobile 'banners')*/}
        {/* ======================================================================= */}
        {(mobileView === "banners" || typeof window === "undefined") && (
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
      </main>

      {/* ========================================================================= */}
      {/* 4. MOBILE NATIVE BOTTOM NAVIGATION BAR (`md:hidden`)                      */}
      {/* ========================================================================= */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-safe bg-[#0a081e]/95 backdrop-blur-2xl border-t border-white/10 shadow-2xl">
        <div className="flex items-center justify-around h-16 px-2">
          {/* Banners Tab */}
          <button
            onClick={() => setMobileView("banners")}
            className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-colors ${
              mobileView === "banners"
                ? "text-purple-400 font-bold"
                : "text-slate-400"
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-[10px]">Banners</span>
          </button>

          {/* Providers Tab */}
          <button
            onClick={() => setMobileView("providers")}
            className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-colors ${
              mobileView === "providers"
                ? "text-purple-400 font-bold"
                : "text-slate-400"
            }`}
          >
            <Server className="w-5 h-5" />
            <span className="text-[10px]">Providers</span>
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
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Image URL * (16:9 ratio recommended)
                </label>
                <input
                  type="url"
                  required
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
                {newImageUrl && (
                  <div className="mt-2.5 relative aspect-[16/9] w-full rounded-xl bg-black/60 border border-white/10 overflow-hidden">
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
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
                {editImageUrl && (
                  <div className="mt-2.5 relative aspect-[16/9] w-full rounded-xl bg-black/60 border border-white/10 overflow-hidden">
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
