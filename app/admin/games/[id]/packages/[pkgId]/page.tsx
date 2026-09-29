"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Coins,
  ArrowUpRight,
  Sliders,
  Percent,
  Check,
  Trash2,
  HelpCircle,
  Layers,
  Tag,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import {
  fetchGame,
  fetchPackage,
  updateGamePackage,
  deleteGamePackage,
  getStoredAdmin,
  clearStoredAdmin,
  verifyAdminSession,
  Game,
  GamePackage,
} from "../../../../../../lib/api";
import {
  GameCurrencyIcon,
  FreeDiamondBadge,
  getGameCurrency,
} from "../../../../../../components/game-currency-icons";

export default function EditPackagePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params?.id as string;
  const pkgId = params?.pkgId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Game & Package data
  const [game, setGame] = useState<Game | null>(null);
  const [originalPackage, setOriginalPackage] = useState<GamePackage | null>(
    null,
  );

  // Form fields
  const [name, setName] = useState("");
  const [nameKh, setNameKh] = useState("");
  const [diamonds, setDiamonds] = useState<number>(0);
  const [bonusDiamonds, setBonusDiamonds] = useState<number>(0);
  const [badgeText, setBadgeText] = useState("");
  const [badgeColor, setBadgeColor] = useState("emerald");
  const [costPriceUsd, setCostPriceUsd] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [order, setOrder] = useState(1);
  const [inStock, setInStock] = useState(true);
  const [isComposite, setIsComposite] = useState(false);
  const [compositeRecipe, setCompositeRecipe] = useState<any>(null);

  // Live preview language toggle
  const [previewLang, setPreviewLang] = useState<"en" | "km">("en");

  // Auth & Initial load
  useEffect(() => {
    const session = getStoredAdmin();
    if (!session) {
      router.replace("/admin/login");
      return;
    }
    verifyAdminSession(session.token).then((verified) => {
      if (!verified) {
        clearStoredAdmin();
        router.replace("/admin/login");
      }
    });

    if (gameId && pkgId) {
      Promise.all([fetchGame(gameId), fetchPackage(pkgId)])
        .then(([gameData, pkgData]) => {
          if (!gameData) {
            setErrorMessage("Game not found.");
            return;
          }
          if (!pkgData) {
            setErrorMessage("Package not found or has been deleted.");
            return;
          }
          setGame(gameData);
          setOriginalPackage(pkgData);

          // Populate fields
          setName(pkgData.name || "");
          setNameKh(pkgData.nameKh || "");
          setDiamonds(pkgData.diamonds || 0);
          setBonusDiamonds(pkgData.bonusDiamonds || 0);
          setBadgeText(pkgData.badgeText || "");
          setBadgeColor(pkgData.badgeColor || "emerald");
          setCostPriceUsd(pkgData.costPriceUsd || "");
          setPriceUsd(pkgData.priceUsd || "");
          setOrder(pkgData.order ?? 1);
          setInStock(pkgData.inStock ?? true);
          setIsComposite(Boolean(pkgData.isComposite));
          setCompositeRecipe(pkgData.compositeRecipe);
        })
        .catch((err) => {
          setErrorMessage(
            err instanceof Error
              ? err.message
              : "Failed to load package information",
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [gameId, pkgId, router]);

  const currencyInfo = game
    ? getGameCurrency(game.slug, game.name)
    : { currencyName: "Diamonds", currencyIcon: "mlbb_diamond" };

  // Margin calculation
  const parsedCost = parseFloat(costPriceUsd || "0");
  const parsedPrice = parseFloat(priceUsd || "0");
  const profit = parsedPrice - parsedCost;
  const marginPct =
    parsedPrice > 0 ? Math.round((profit / parsedPrice) * 100) : 0;

  // Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Please enter a package name.");
      return;
    }
    if (!priceUsd.trim() || isNaN(Number(priceUsd))) {
      setErrorMessage("Please enter a valid selling price ($USD).");
      return;
    }

    setSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const updated = await updateGamePackage(pkgId, {
        name: name.trim(),
        nameKh: nameKh.trim() || null,
        diamonds: Number(diamonds) || 0,
        bonusDiamonds: Number(bonusDiamonds) || 0,
        badgeText: badgeText.trim() || null,
        badgeColor: badgeColor || "emerald",
        priceUsd: priceUsd.trim(),
        costPriceUsd: costPriceUsd.trim() || null,
        order: Number(order) || 1,
        inStock,
      });

      setOriginalPackage(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to update package.",
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this package? This action cannot be undone.",
      )
    )
      return;
    setDeleting(true);
    try {
      await deleteGamePackage(pkgId);
      router.replace(`/admin/games/${gameId}`);
    } catch (err) {
      alert(
        "Failed to delete package: " +
          (err instanceof Error ? err.message : ""),
      );
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070518] text-white flex flex-col items-center justify-center p-6">
        <Loader2 className="w-10 h-10 animate-spin text-purple-400 mb-4" />
        <p className="text-sm text-slate-400">Loading package details...</p>
      </div>
    );
  }

  if (errorMessage && !game) {
    return (
      <div className="min-h-screen bg-[#070518] text-white flex flex-col items-center justify-center p-6">
        <div className="p-6 rounded-3xl bg-red-500/10 border border-red-500/30 max-w-md text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">
            Error Loading Package
          </h2>
          <p className="text-xs text-slate-400 mb-6">{errorMessage}</p>
          <Link
            href={`/admin/games/${gameId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-bold text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Game
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070518] text-white pb-24">
      {/* Top Ambient Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-gradient-to-b from-purple-600/15 via-pink-600/5 to-transparent blur-3xl pointer-events-none z-0" />

      {/* Header Sticky Bar */}
      <header className="sticky top-0 z-30 bg-[#0a0720]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href={`/admin/games/${gameId}`}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-colors shrink-0"
              title="Return to game catalog"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-sm sm:text-base font-black text-white truncate">
                  Edit Package
                </h1>
                {isComposite ? (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-purple-500/25 to-pink-500/25 text-purple-300 border border-purple-500/40">
                    ⚡ Mixed Pack
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30">
                    Direct Tier
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-400 bg-white/5 border border-white/5 truncate max-w-[140px]">
                  {game?.name}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || saving}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-bold transition-all flex items-center gap-1.5"
              title="Delete package"
            >
              {deleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Delete</span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 hover:opacity-95 text-xs font-black text-white shadow-lg shadow-purple-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 relative z-10">
        {/* Save Success Toast */}
        {saveSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg shadow-emerald-500/10 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Package settings and pricing successfully updated!</span>
            </div>
            <button
              onClick={() => setSaveSuccess(false)}
              className="text-emerald-400 hover:text-white px-2 py-1 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-bold flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-white px-2 py-1 text-xs"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (8 cols): Package Configuration */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {/* Section 1: Basic Information */}
              <div className="p-6 rounded-3xl bg-[#0e0a2b]/80 border border-white/10 shadow-xl space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white">
                      Package Titles & Identity
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Bilingual naming displayed on the storefront checkout
                      cards.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Package Name (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. 50 + 5 Diamonds"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Package Name (Khmer ខ្មែរ)
                    </label>
                    <input
                      type="text"
                      value={nameKh}
                      onChange={(e) => setNameKh(e.target.value)}
                      placeholder="e.g. ពេជ្រ ៥០ + ៥ គ្រាប់"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-400 font-khmer"
                    />
                  </div>
                </div>

                {/* Composite Recipe Details (if mixed package) */}
                {isComposite && compositeRecipe && (
                  <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current" />
                        Mixed Recipe Composition
                      </span>
                      <span className="text-[10px] text-purple-400/80 font-mono">
                        Auto-fulfilled from provider
                      </span>
                    </div>
                    {Array.isArray(compositeRecipe) ? (
                      <div className="space-y-1.5 pt-1">
                        {compositeRecipe.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-xl bg-black/30 border border-white/5 text-xs"
                          >
                            <span className="text-slate-300">
                              {item.quantity || 1}x{" "}
                              {item.name || item.packageId}
                            </span>
                            <span className="font-mono text-purple-300 font-bold">
                              $
                              {item.priceUsd
                                ? (
                                    Number(item.priceUsd) * (item.quantity || 1)
                                  ).toFixed(2)
                                : "0.00"}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <pre className="text-[11px] text-slate-400 p-2 rounded bg-black/30 overflow-x-auto">
                        {JSON.stringify(compositeRecipe, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>

              {/* Section 2: Currency, Bonus & Badges */}
              <div className="p-6 rounded-3xl bg-[#0e0a2b]/80 border border-white/10 shadow-xl space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white">
                      Currency Amounts & Bonus Badges
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Configure diamond numbers, free bonus counts, and animated
                      badges.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Base {currencyInfo.currencyName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Count
                      </span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={diamonds}
                      onChange={(e) =>
                        setDiamonds(parseInt(e.target.value, 10) || 0)
                      }
                      placeholder="e.g. 50"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Bonus Free {currencyInfo.currencyName}</span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        +Free
                      </span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={bonusDiamonds}
                      onChange={(e) =>
                        setBonusDiamonds(parseInt(e.target.value, 10) || 0)
                      }
                      placeholder="e.g. 5"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                {/* Badge text & Color theme */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Badge Text (e.g. +5 Bonus, Hot, VIP)
                      </label>
                      <input
                        type="text"
                        value={badgeText}
                        onChange={(e) => setBadgeText(e.target.value)}
                        placeholder="e.g. +5 Free Bonus"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">
                        Badge Glow Theme
                      </label>
                      <select
                        value={badgeColor}
                        onChange={(e) => setBadgeColor(e.target.value)}
                        className="w-full bg-[#16122d] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                      >
                        <option value="emerald">Emerald (Green Glow)</option>
                        <option value="pink">Pink / Rose Glow</option>
                        <option value="amber">Amber / Gold Glow</option>
                        <option value="purple">Purple / VIP Glow</option>
                        <option value="cyan">Cyan / Ice Glow</option>
                      </select>
                    </div>
                  </div>

                  {/* Badge Preview Chip */}
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-[11px] text-slate-400">
                      Badge Preview:
                    </span>
                    <FreeDiamondBadge
                      bonusDiamonds={bonusDiamonds}
                      badgeText={badgeText}
                      badgeColor={badgeColor}
                      size="md"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Pricing & Profit Margins */}
              <div className="p-6 rounded-3xl bg-[#0e0a2b]/80 border border-white/10 shadow-xl space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-300">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white">
                      Pricing & Profit Margin Calculator
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Set retail price in $USD and review net wholesale margin.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                    <label className="block text-xs font-bold text-slate-400">
                      Wholesale Cost ($USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-xs">
                        $
                      </span>
                      <input
                        type="text"
                        value={costPriceUsd}
                        onChange={(e) => setCostPriceUsd(e.target.value)}
                        placeholder="0.50"
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-3 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Cost charged by KAS reseller provider.
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 space-y-2">
                    <label className="block text-xs font-bold text-purple-300">
                      Customer Retail Price ($USD) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 text-xs font-bold">
                        $
                      </span>
                      <input
                        type="text"
                        required
                        value={priceUsd}
                        onChange={(e) => setPriceUsd(e.target.value)}
                        placeholder="0.65"
                        className="w-full bg-white/5 border border-purple-500/30 rounded-xl pl-7 pr-3 py-2 text-sm text-amber-300 font-black font-mono focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <span className="text-[10px] text-purple-300/80 block">
                      Visible checkout price for customers.
                    </span>
                  </div>
                </div>

                {/* Live Margin Calculation Bar */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/20 to-pink-900/30 border border-white/10 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-300 block">
                        Net Profit per Sale
                      </span>
                      <span className="text-base font-black text-emerald-400 font-mono">
                        {profit >= 0
                          ? `+$${profit.toFixed(2)}`
                          : `-$${Math.abs(profit).toFixed(2)}`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 block">
                      Profit Margin
                    </span>
                    <span
                      className={`text-base font-black font-mono ${
                        marginPct >= 15
                          ? "text-emerald-400"
                          : marginPct > 0
                            ? "text-amber-400"
                            : "text-red-400"
                      }`}
                    >
                      {marginPct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 4: Display Order & Stock Status */}
              <div className="p-6 rounded-3xl bg-[#0e0a2b]/80 border border-white/10 shadow-xl space-y-5">
                <div className="flex items-center gap-2.5 pb-4 border-b border-white/10">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-300">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-white">
                      Stock Availability & Display Order
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Control visibility and sorting position in the package
                      selector.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Display Order (Sort Index)
                    </label>
                    <input
                      type="number"
                      value={order}
                      onChange={(e) =>
                        setOrder(parseInt(e.target.value, 10) || 1)
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">
                      Lower numbers appear first (e.g. 1, 2, 3).
                    </span>
                  </div>

                  <div className="flex flex-col justify-center">
                    <label className="text-xs font-bold text-slate-300 mb-2">
                      In-Stock Availability
                    </label>
                    <button
                      type="button"
                      onClick={() => setInStock(!inStock)}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                        inStock
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                          : "bg-red-500/15 border-red-500/40 text-red-300"
                      }`}
                    >
                      <span className="text-xs font-bold">
                        {inStock
                          ? "✓ In Stock (Purchasable)"
                          : "✕ Out of Stock (Disabled)"}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-black/40">
                        {inStock ? "Active" : "Hidden"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (4-5 cols): Sticky Live Card Preview */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-24 space-y-6">
                {/* Live Preview Card */}
                <div className="p-6 rounded-3xl bg-gradient-to-b from-[#15103a] to-[#0d0a27] border border-purple-500/30 shadow-2xl shadow-purple-500/10 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-white">
                        Live Storefront Card
                      </h3>
                    </div>

                    {/* Language Switcher */}
                    <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10">
                      <button
                        type="button"
                        onClick={() => setPreviewLang("en")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                          previewLang === "en"
                            ? "bg-purple-600 text-white shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewLang("km")}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-khmer transition-all ${
                          previewLang === "km"
                            ? "bg-pink-600 text-white shadow"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        ខ្មែរ
                      </button>
                    </div>
                  </div>

                  {/* Customer Package Card Preview */}
                  <div className="relative p-4 rounded-2xl border transition-all flex flex-col justify-between bg-gradient-to-b from-[#1d164d] to-[#120e33] border-purple-500/40 shadow-xl">
                    {/* Top: Icon + Name + Type */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <GameCurrencyIcon
                            iconType={currencyInfo.currencyIcon}
                            className="w-6 h-6 shrink-0 drop-shadow-md"
                          />
                          <div className="min-w-0">
                            <h4
                              className={`text-xs font-black text-white truncate ${
                                previewLang === "km" && nameKh
                                  ? "font-khmer text-pink-300"
                                  : ""
                              }`}
                            >
                              {previewLang === "km" && nameKh
                                ? nameKh
                                : name || "Package Name"}
                            </h4>
                            {nameKh && previewLang === "en" && (
                              <p className="text-[10px] text-pink-300 font-khmer truncate">
                                {nameKh}
                              </p>
                            )}
                          </div>
                        </div>

                        {isComposite ? (
                          <span className="shrink-0 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/25 to-pink-500/25 text-amber-300 border border-amber-500/40">
                            ⚡ Mixed
                          </span>
                        ) : (
                          <span className="shrink-0 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30">
                            Direct
                          </span>
                        )}
                      </div>

                      {/* Free Diamond Badge & Currency Preview */}
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <FreeDiamondBadge
                          bonusDiamonds={bonusDiamonds}
                          badgeText={badgeText}
                          badgeColor={badgeColor}
                          size="sm"
                        />
                        {diamonds > 0 && (
                          <span className="text-[11px] text-slate-300 font-mono">
                            {diamonds} {currencyInfo.currencyName}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Price and Stock Status */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between mt-2">
                      <div>
                        <span className="text-base font-black text-amber-400 font-mono">
                          ${priceUsd || "0.00"}
                        </span>
                        {parsedCost > 0 && (
                          <span className="text-[10px] text-slate-400 font-mono block">
                            Cost: ${parsedCost.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                          inStock
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : "bg-red-500/20 text-red-300 border-red-500/40"
                        }`}
                      >
                        {inStock ? "In Stock" : "Sold Out"}
                      </span>
                    </div>
                  </div>

                  {/* Summary Details */}
                  <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Profit Margin:</span>
                      <span className="text-emerald-400 font-mono font-bold">
                        +${profit.toFixed(2)} ({marginPct}%)
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Display Sort Order:</span>
                      <span className="text-white font-mono font-bold">
                        #{order}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Storefront Visibility:</span>
                      <span
                        className={
                          inStock
                            ? "text-emerald-400 font-bold"
                            : "text-red-400 font-bold"
                        }
                      >
                        {inStock ? "Live to Customers" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  {/* Sticky Save Action inside sidebar */}
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 hover:opacity-95 text-xs font-black text-white shadow-xl shadow-purple-600/30 transition-all active:scale-98 disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Package...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Package Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
