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
} from "lucide-react";
import {
  fetchBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getStoredAdmin,
  clearStoredAdmin,
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

  // New banner form state
  const [newTitle, setNewTitle] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newOrder, setNewOrder] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const session = getStoredAdmin();
    if (!session) {
      router.push("/admin/login");
      return;
    }
    setAdmin(session.user);
    loadBanners();
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

  const handleLogout = () => {
    clearStoredAdmin();
    router.push("/admin/login");
  };

  if (!admin) {
    return (
      <div className="min-h-screen bg-[#07080d] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const activeCount = banners.filter((b) => b.isActive).length;

  return (
    <div className="min-h-screen bg-[#07080d] text-slate-100 flex flex-col">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 bg-[#0e111a]/90 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base">
                  The Coin Store Admin
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {admin.role}
                </span>
              </div>
              <span className="text-xs text-slate-400">{admin.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 flex items-center gap-2 transition-colors"
            >
              <Store className="w-4 h-4 text-amber-400" />
              Live Storefront
            </Link>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-xs font-semibold text-red-400 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-8 w-full">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="rounded-2xl bg-[#0e111a] border border-white/10 p-6 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wider font-medium">
                Active Banners
              </span>
              <span className="text-3xl font-extrabold text-white">
                {activeCount}{" "}
                <span className="text-sm font-normal text-slate-500">
                  / {banners.length}
                </span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <ImageIcon className="w-6 h-6" />
            </div>
          </div>

          <div className="rounded-2xl bg-[#0e111a] border border-white/10 p-6 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wider font-medium">
                Reseller Service
              </span>
              <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 mt-1">
                <Zap className="w-4 h-4 text-emerald-400" />
                API Connected
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Server className="w-6 h-6" />
            </div>
          </div>

          <div className="rounded-2xl bg-[#0e111a] border border-white/10 p-6 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1 uppercase tracking-wider font-medium">
                Top-Up Provider
              </span>
              <span className="text-xs text-slate-300 font-semibold block mt-1">
                Automated Gateway
              </span>
              <span className="text-[11px] text-slate-500">
                Ready for Provider Webhook
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Banner Management Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-amber-400" />
              Promotional Banners (Home Page API)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage hero banner promotions and carousels displayed on the
              selling route
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadBanners}
              disabled={loading || actionLoading}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 transition-colors"
              title="Refresh banners"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin text-amber-400" : ""}`}
              />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs hover:opacity-95 transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New Banner
            </button>
          </div>
        </div>

        {/* Banners List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500 mb-3" />
            <p className="text-xs">Loading banners from API...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="rounded-3xl bg-[#0e111a] border border-white/10 p-12 text-center">
            <ImageIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-bold text-white text-base">No Banners Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">
              You do not have any promotional banners configured. Add your first
              hero banner for the home page.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Banner
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <div
                key={banner.id}
                className={`rounded-2xl bg-[#0e111a] border transition-all overflow-hidden flex flex-col justify-between ${
                  banner.isActive
                    ? "border-white/10 hover:border-amber-500/40"
                    : "border-white/5 opacity-60"
                }`}
              >
                <div>
                  {/* Banner Image Preview */}
                  <div className="relative aspect-[16/9] w-full bg-slate-900 overflow-hidden">
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-slate-300 border border-white/10">
                      Order #{banner.order}
                    </div>
                    <div className="absolute top-2 right-2">
                      {banner.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 backdrop-blur-md">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-[10px] font-bold text-red-400 backdrop-blur-md">
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
                      <div className="flex items-center gap-1 text-[11px] text-amber-400/80 truncate">
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{banner.linkUrl}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        No redirect link
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-white/5 flex items-center justify-between gap-2 mt-2">
                  <button
                    onClick={() => handleToggleStatus(banner)}
                    disabled={actionLoading}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      banner.isActive
                        ? "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                        : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    {banner.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDeleteBanner(banner.id)}
                    disabled={actionLoading}
                    className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors"
                    title="Delete banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Banner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0e111a] border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                Add Promotional Banner
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Banner Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Mobile Legends Diamond Bonus Event"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Image URL * (Recommended: 16:9 ratio)
                </label>
                <input
                  type="url"
                  required
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Route / Link
                  </label>
                  <input
                    type="text"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="/games/mobile-legends"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newOrder}
                    onChange={(e) => setNewOrder(Number(e.target.value))}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-400/50"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs hover:opacity-95 transition-opacity flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50"
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
    </div>
  );
}
