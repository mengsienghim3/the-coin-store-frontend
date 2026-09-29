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
  UploadCloud,
  Gamepad2,
  Sparkles,
  Eye,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Check,
  Globe,
  Plus,
  Trash2,
  RefreshCw,
  Sliders,
  Percent,
  Coins,
  PackageCheck,
  X,
  Pencil,
  UserCheck,
} from "lucide-react";
import {
  fetchGame,
  updateGame,
  uploadImage,
  getStoredAdmin,
  clearStoredAdmin,
  verifyAdminSession,
  Game,
  GamePackage,
  fetchGamePackages,
  syncGamePackages,
  createGamePackage,
  updateGamePackage,
  deleteGamePackage,
  validatePlayer,
  PlayerValidationResult,
} from "../../../../lib/api";
import {
  GameCurrencyIcon,
  FreeDiamondBadge,
  getGameCurrency,
} from "../../../../components/game-currency-icons";

const PRESET_CATEGORIES = [
  "MOBA",
  "Battle Royale",
  "RPG",
  "FPS",
  "Sports",
  "Strategy",
  "MMORPG",
  "Card & Casual",
  "Simulation",
];

const CURRENCY_OPTIONS = [
  {
    id: "mlbb_diamond",
    name: "MLBB Diamonds",
    label: "Mobile Legends Diamond (Cyan)",
  },
  {
    id: "ff_diamond",
    name: "Free Fire Diamonds",
    label: "Free Fire Diamond (Aquamarine)",
  },
  { id: "pubg_uc", name: "PUBG UC", label: "PUBG Unknown Cash (Gold Medal)" },
  { id: "robux", name: "Robux", label: "Roblox Robux (Gold Hexagon)" },
  {
    id: "genshin_crystal",
    name: "Genesis Crystals",
    label: "Genshin Crystals (Star Prism)",
  },
  {
    id: "telegram_star",
    name: "Telegram Stars",
    label: "Telegram Stars (Gold Star)",
  },
  {
    id: "default_diamond",
    name: "Diamonds",
    label: "Standard Diamond (Gemstone)",
  },
];

export default function EditGamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Original game data
  const [originalGame, setOriginalGame] = useState<Game | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [nameKh, setNameKh] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("MOBA");
  const [customCategory, setCustomCategory] = useState("");
  const [publisher, setPublisher] = useState("");
  const [hasZoneId, setHasZoneId] = useState(false);
  const [inputGuide, setInputGuide] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [order, setOrder] = useState(1);
  const [isActive, setIsActive] = useState(true);

  // Currency states
  const [currencyName, setCurrencyName] = useState("Diamonds");
  const [currencyIcon, setCurrencyIcon] = useState("mlbb_diamond");

  // Artwork & Cloudflare R2 Upload states
  const [imageUrl, setImageUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadSuccess, setCoverUploadSuccess] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);

  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerUploadSuccess, setBannerUploadSuccess] = useState(false);
  const [bannerUploadError, setBannerUploadError] = useState<string | null>(
    null,
  );

  // Live Card Preview language toggle
  const [previewLang, setPreviewLang] = useState<"en" | "km">("km");

  // Package Management States
  const [packages, setPackages] = useState<GamePackage[]>([]);
  const [providerPackages, setProviderPackages] = useState<
    Array<{
      id: string;
      name: string;
      priceUsd: number;
      retailPriceUsd?: number;
    }>
  >([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [syncingPackages, setSyncingPackages] = useState(false);
  const [packageMessage, setPackageMessage] = useState<string | null>(null);

  // Live Player Validation Test state
  const [testPlayerId, setTestPlayerId] = useState("370635223");
  const [testServerId, setTestServerId] = useState("3753");
  const [testingValidation, setTestingValidation] = useState(false);
  const [testValidationResult, setTestValidationResult] =
    useState<PlayerValidationResult | null>(null);
  const [testValidationErr, setTestValidationErr] = useState<string | null>(
    null,
  );

  const handleTestValidate = async () => {
    if (!testPlayerId.trim()) return;
    setTestingValidation(true);
    setTestValidationResult(null);
    setTestValidationErr(null);

    try {
      const fields: Record<string, string> = { player_id: testPlayerId.trim() };
      if (testServerId.trim()) {
        fields.server_id = testServerId.trim();
      }
      const res = await validatePlayer(
        gameId,
        fields,
        originalGame?.providerCategoryId,
      );
      setTestValidationResult(res);
      if (!res.valid) {
        setTestValidationErr(
          res.message || "Player not found. Upstream returned valid=false.",
        );
      }
    } catch (err: unknown) {
      setTestValidationErr(
        err instanceof Error ? err.message : "Validation request failed",
      );
    } finally {
      setTestingValidation(false);
    }
  };

  // Auth & Data loading
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
        return;
      }
    });

    if (gameId) {
      loadGameData(gameId);
    }
  }, [gameId, router]);

  const loadGameData = async (id: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const data = await fetchGame(id);
      if (!data) {
        setErrorMessage("Game not found or has been removed.");
        setLoading(false);
        return;
      }
      setOriginalGame(data);
      setName(data.name);
      setNameKh(data.nameKh || "");
      setSlug(data.slug);
      if (PRESET_CATEGORIES.includes(data.category)) {
        setCategory(data.category);
      } else {
        setCategory("Other");
        setCustomCategory(data.category);
      }
      setPublisher(data.publisher || "");
      setHasZoneId(data.hasZoneId ?? false);
      setInputGuide(data.inputGuide || "");
      setStartingPrice(data.startingPrice || "");
      setOrder(data.order || 0);
      setIsActive(data.isActive);
      setImageUrl(data.imageUrl);
      setBannerUrl(data.bannerUrl || "");

      // Currency
      const defaultCurr = getGameCurrency(data.slug, data.name);
      const currName = (data as any).currencyName || defaultCurr.currencyName;
      const currIcon = (data as any).currencyIcon || defaultCurr.currencyIcon;
      setCurrencyName(currName);
      setCurrencyIcon(currIcon);

      // Load packages for this game
      loadPackages(id);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to load game information",
      );
    } finally {
      setLoading(false);
    }
  };

  const loadPackages = async (id: string) => {
    setLoadingPackages(true);
    try {
      const res = await fetchGamePackages(id);
      if (res?.packages) {
        setPackages(res.packages);
      }
      if (res?.providerPackages) {
        setProviderPackages(res.providerPackages);
      }
    } catch (err) {
      console.warn("Failed to load packages:", err);
    } finally {
      setLoadingPackages(false);
    }
  };

  const handleSyncPackages = async () => {
    if (!gameId) return;
    setSyncingPackages(true);
    setPackageMessage(null);
    try {
      const res = await syncGamePackages(gameId);
      setPackages(res.packages || []);
      setPackageMessage(
        `Synced successfully! ${res.synced} packages received (${res.created} added, ${res.updated} updated).`,
      );
      setTimeout(() => setPackageMessage(null), 5000);
    } catch (err) {
      setPackageMessage(
        `Sync failed: ${err instanceof Error ? err.message : "Unknown error"}`,
      );
    } finally {
      setSyncingPackages(false);
    }
  };

  const handleCoverUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingCover(true);
    setCoverUploadError(null);
    setCoverUploadSuccess(false);
    try {
      const res = await uploadImage(file);
      setImageUrl(res.url);
      setCoverUploadSuccess(true);
      setTimeout(() => setCoverUploadSuccess(false), 4000);
    } catch (err) {
      setCoverUploadError(
        err instanceof Error
          ? err.message
          : "Cover upload to Cloudflare R2 failed",
      );
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleBannerUpload = async (file: File) => {
    if (!file) return;
    setIsUploadingBanner(true);
    setBannerUploadError(null);
    setBannerUploadSuccess(false);
    try {
      const res = await uploadImage(file);
      setBannerUrl(res.url);
      setBannerUploadSuccess(true);
      setTimeout(() => setBannerUploadSuccess(false), 4000);
    } catch (err) {
      setBannerUploadError(
        err instanceof Error
          ? err.message
          : "Banner upload to Cloudflare R2 failed",
      );
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId || !originalGame) return;

    setSaving(true);
    setErrorMessage(null);
    setSaveSuccess(false);

    try {
      const finalCategory =
        category === "Other" && customCategory.trim()
          ? customCategory.trim()
          : category;

      const isNewName = name.trim() !== originalGame.name;
      const isNewImage = imageUrl.trim() !== originalGame.imageUrl;

      const updated = await updateGame(gameId, {
        name: name.trim(),
        nameKh: nameKh.trim() || null,
        slug: slug.trim() || undefined,
        category: finalCategory,
        publisher: publisher.trim() || null,
        hasZoneId,
        inputGuide: inputGuide.trim() || null,
        startingPrice: startingPrice.trim() || null,
        order: Number(order),
        isActive,
        imageUrl: imageUrl.trim(),
        bannerUrl: bannerUrl.trim() || null,
        isCustomName: isNewName ? true : originalGame.isCustomName,
        isCustomImage: isNewImage ? true : originalGame.isCustomImage,
        currencyName,
        currencyIcon,
      } as any);

      setOriginalGame(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 5000);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to save game changes",
      );
    } finally {
      setSaving(false);
    }
  };

  // Toggle package in-stock status
  const handleToggleStock = async (pkg: GamePackage) => {
    try {
      const newStock = !pkg.inStock;
      const updated = await updateGamePackage(pkg.id, { inStock: newStock });
      setPackages((prev) =>
        prev.map((p) => (p.id === pkg.id ? { ...p, inStock: newStock } : p)),
      );
    } catch (err) {
      alert(
        "Failed to update stock status: " +
          (err instanceof Error ? err.message : ""),
      );
    }
  };

  // Delete a package
  const handleDeletePackage = async (pkgId: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return;
    try {
      await deleteGamePackage(pkgId);
      setPackages((prev) => prev.filter((p) => p.id !== pkgId));
    } catch (err) {
      alert(
        "Failed to delete package: " +
          (err instanceof Error ? err.message : ""),
      );
    }
  };

  // Preview display values
  const previewDisplayName =
    previewLang === "km" && nameKh.trim() ? nameKh.trim() : name || "Game Name";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b091f] flex flex-col items-center justify-center p-6 text-white">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-300">
          Loading game configuration...
        </p>
      </div>
    );
  }

  if (errorMessage && !originalGame) {
    return (
      <div className="min-h-screen bg-[#0b091f] flex flex-col items-center justify-center p-6 text-white">
        <div className="max-w-md w-full rounded-3xl bg-[#141033] border border-red-500/20 p-8 text-center shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-black mb-2">Game Not Found</h2>
          <p className="text-xs text-slate-400 mb-6">{errorMessage}</p>
          <Link
            href="/admin?view=games"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Games Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b091f] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white pb-24">
      {/* ========================================================================= */}
      {/* 1. STICKY TOP HEADER                                                      */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#0d0a27]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Left: Back Link & Title */}
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/admin?view=games"
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex items-center justify-center group"
              title="Return to Games Catalog"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">
                  Games Catalog / Editor
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                  }`}
                >
                  {isActive ? "Active on Store" : "Inactive"}
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  <GameCurrencyIcon
                    iconType={currencyIcon}
                    className="w-3.5 h-3.5"
                  />
                  <span>{currencyName}</span>
                </span>
              </div>
              <h1 className="text-base sm:text-lg md:text-xl font-black text-white truncate drop-shadow-sm">
                {name || "Untitled Game"}
              </h1>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/admin?view=games"
              className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all"
            >
              Cancel
            </Link>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 hover:opacity-95 text-white text-xs font-black shadow-lg shadow-purple-600/30 active:scale-98 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <Check className="w-4 h-4 text-white stroke-[3]" />
                  <span>Saved!</span>
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

      {/* ========================================================================= */}
      {/* 2. SUCCESS / ERROR FLOATING BANNERS                                       */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
        {saveSuccess && (
          <div className="mb-4 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold">
                  Game details saved successfully!
                </p>
                <p className="text-[11px] text-emerald-400/80">
                  Changes are live immediately on the customer storefront.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSaveSuccess(false)}
              className="text-emerald-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 flex items-center justify-between gap-3 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              <p className="text-xs font-bold">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-400 hover:text-white text-xs p-1"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE GRID                                                    */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full flex-1 space-y-8">
        <form
          onSubmit={handleSave}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6"
        >
          {/* ===================================================================== */}
          {/* LEFT COLUMN: GAME DETAILS & PLAYER RULES (8 Cols)                     */}
          {/* ===================================================================== */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* Card 1: Identity & Currency Configuration */}
            <div className="rounded-3xl bg-[#141033] border border-white/10 p-6 sm:p-7 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-extrabold text-white">
                    1. Game Identity & Bilingual Naming
                  </h2>
                </div>
                <span className="text-[10px] text-purple-300 font-mono bg-purple-900/30 px-2 py-0.5 rounded border border-purple-500/30">
                  ID: {originalGame?.providerCategoryId || originalGame?.id}
                </span>
              </div>

              {/* English Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Game Display Name (English) *
                  </label>
                  <span className="text-[10px] text-purple-400 font-medium">
                    Preserved on provider sync
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mobile Legends (Cambodia)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all font-medium"
                />
              </div>

              {/* Khmer Display Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <span>🇰🇭 Khmer Display Name (ឈ្មោះជាភាសាខ្មែរ)</span>
                  </label>
                  <span className="text-[10px] text-pink-400 font-medium">
                    Preserved on provider sync
                  </span>
                </div>
                <input
                  type="text"
                  value={nameKh}
                  onChange={(e) => setNameKh(e.target.value)}
                  placeholder="e.g. ម៉ូបាលលេជេន (កម្ពុជា)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition-all font-khmer"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  When a customer selects Khmer (ខ្មែរ), this title is rendered
                  on the storefront and modal.
                </p>
              </div>

              {/* Game Currency Type & Icon Selection */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Game Currency & Icon Branding
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Specifies the official in-game currency name and custom
                      vector SVG icon.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-purple-900/40 border border-purple-500/30 px-3 py-1.5 rounded-xl">
                    <GameCurrencyIcon
                      iconType={currencyIcon}
                      className="w-5 h-5"
                    />
                    <span className="text-xs font-extrabold text-white">
                      {currencyName}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Currency Icon Type
                    </label>
                    <select
                      value={currencyIcon}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCurrencyIcon(val);
                        const opt = CURRENCY_OPTIONS.find((o) => o.id === val);
                        if (opt) setCurrencyName(opt.name);
                      }}
                      className="w-full bg-[#1b1646] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
                    >
                      {CURRENCY_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Currency Display Label
                    </label>
                    <input
                      type="text"
                      value={currencyName}
                      onChange={(e) => setCurrencyName(e.target.value)}
                      placeholder="e.g. Diamonds, UC, Robux, Stars"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Category & Publisher (Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Game Category / Genre *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#1b1646] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                  >
                    {PRESET_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="Other">Other (Custom Genre)</option>
                  </select>
                  {category === "Other" && (
                    <input
                      type="text"
                      placeholder="Enter custom category"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="mt-2 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Publisher / Developer
                  </label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="e.g. Moonton, Garena, Riot Games"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              {/* URL Slug */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  URL Slug
                </label>
                <div className="flex items-center rounded-xl bg-white/5 border border-white/10 px-3.5 py-2.5">
                  <span className="text-xs text-slate-500 select-none">
                    /games/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="mobile-legends-cambodia"
                    className="flex-1 bg-transparent text-xs text-purple-300 font-mono focus:outline-none ml-1"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Player Input & Topup Rules */}
            <div className="rounded-3xl bg-[#141033] border border-white/10 p-6 sm:p-7 shadow-xl space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-extrabold text-white">
                  2. Player Recharge & Verification Rules
                </h2>
              </div>

              {/* Zone ID Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Requires Server / Zone ID
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Enable if player accounts require both User ID and Zone ID
                    (e.g. MLBB format: 12345678 (1234)).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setHasZoneId(!hasZoneId)}
                  className={`w-12 h-7 rounded-full p-1 transition-colors ${
                    hasZoneId ? "bg-purple-600" : "bg-white/10"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      hasZoneId ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Player ID Guide */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Customer ID Input Guide
                </label>
                <input
                  type="text"
                  value={inputGuide}
                  onChange={(e) => setInputGuide(e.target.value)}
                  placeholder="e.g. Enter User ID & Zone ID (tap your avatar in game to find it)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Provider Metadata (Read-Only) */}
              <div className="p-4 rounded-2xl bg-[#100c2a] border border-white/5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">
                    Provider Validation
                  </span>
                  <span
                    className={`font-bold mt-0.5 inline-block ${
                      originalGame?.canValidate
                        ? "text-emerald-400"
                        : "text-slate-400"
                    }`}
                  >
                    {originalGame?.canValidate
                      ? "✓ Supported"
                      : "Not available"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">
                    Available Packages
                  </span>
                  <span className="font-bold text-white mt-0.5 inline-block">
                    {packages.length} active packages
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">
                    KAS Provider ID
                  </span>
                  <span className="font-mono text-[11px] text-purple-300 mt-0.5 block truncate">
                    {originalGame?.providerId || "N/A"}
                  </span>
                </div>
              </div>

              {/* Live Player Validation Tester */}
              {originalGame?.canValidate && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/20 via-[#100c2a] to-emerald-950/20 border border-purple-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-white">
                        Test Upstream Player Validation (/validate-player)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-300">
                      {originalGame.providerCategoryId}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                    <div className="sm:col-span-5">
                      <label className="block text-[10px] text-slate-400 mb-1">
                        Test Player ID
                      </label>
                      <input
                        type="text"
                        value={testPlayerId}
                        onChange={(e) => setTestPlayerId(e.target.value)}
                        placeholder="e.g. 370635223"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] text-slate-400 mb-1">
                        Test Server / Zone ID
                      </label>
                      <input
                        type="text"
                        value={testServerId}
                        onChange={(e) => setTestServerId(e.target.value)}
                        placeholder="e.g. 3753"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-purple-400"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <button
                        type="button"
                        disabled={testingValidation || !testPlayerId.trim()}
                        onClick={handleTestValidate}
                        className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        {testingValidation ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Checking...</span>
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Test API</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {testValidationResult?.valid && (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300 animate-in fade-in">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>
                          Valid Account:{" "}
                          <strong className="text-white">
                            {testValidationResult.playerName}
                          </strong>
                          {testValidationResult.region
                            ? ` (${testValidationResult.region})`
                            : ""}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">
                        201 OK
                      </span>
                    </div>
                  )}

                  {testValidationErr && (
                    <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2 animate-in fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{testValidationErr}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Card 3: Display & Visibility Settings */}
            <div className="rounded-3xl bg-[#141033] border border-white/10 p-6 sm:p-7 shadow-xl space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-extrabold text-white">
                  3. Storefront Visibility & Display Order
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Active Status */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col justify-between">
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Storefront Visibility
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`w-full py-2 rounded-xl text-xs font-extrabold border transition-all ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-md shadow-emerald-500/10"
                        : "bg-white/5 text-slate-400 border-white/10"
                    }`}
                  >
                    {isActive ? "✓ Publicly Visible" : "✕ Hidden / Inactive"}
                  </button>
                </div>

                {/* Display Order */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                    min={0}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm font-mono text-white text-center focus:outline-none focus:border-purple-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block text-center">
                    Lower number appears first
                  </span>
                </div>

                {/* Starting Price */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10">
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    Starting Price Badge
                  </label>
                  <input
                    type="text"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                    placeholder="e.g. $0.99"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm font-mono text-amber-400 text-center focus:outline-none focus:border-purple-400"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block text-center">
                    Shown as &ldquo;From \$X.XX&rdquo;
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* RIGHT COLUMN: ARTWORK & LIVE PREVIEW (4-5 Cols)                       */}
          {/* ===================================================================== */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-6">
            {/* Card: Cloudflare R2 Cover Artwork Upload */}
            <div className="rounded-3xl bg-[#141033] border border-white/10 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Game Cover Art
                  </h3>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">
                  Cloudflare R2
                </span>
              </div>

              {/* Image Dropzone */}
              <div className="relative border-2 border-dashed border-white/15 hover:border-purple-500/50 rounded-2xl p-5 bg-white/[0.02] text-center transition-all group">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCoverUpload(file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  disabled={isUploadingCover}
                />
                <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                  {isUploadingCover ? (
                    <>
                      <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                      <span className="text-xs font-bold text-white">
                        Uploading to Cloudflare R2...
                      </span>
                    </>
                  ) : coverUploadSuccess ? (
                    <>
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300">
                        Uploaded successfully!
                      </span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-purple-400 transition-colors" />
                      <span className="text-xs font-bold text-white">
                        Drop image or click to upload
                      </span>
                      <span className="text-[10px] text-slate-500">
                        PNG, JPG, WebP up to 10MB
                      </span>
                    </>
                  )}
                </div>
              </div>

              {coverUploadError && (
                <p className="text-xs text-red-400">{coverUploadError}</p>
              )}

              {/* Direct Cover URL Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Or Paste Direct Image URL:
                </label>
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-purple-300 font-mono focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Optional Header Banner URL */}
              <div className="pt-2 border-t border-white/5">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-400">
                    Header Banner Artwork (Optional)
                  </label>
                  <label className="text-[10px] text-purple-400 cursor-pointer hover:underline">
                    Upload R2
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleBannerUpload(file);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://... (Widescreen header art)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-purple-300 font-mono focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            {/* Card: Real-Time Storefront Live Card Preview */}
            <div className="rounded-3xl bg-[#141033] border border-white/10 p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Live Storefront Preview
                  </h3>
                </div>

                {/* Preview Language Switcher */}
                <div className="flex items-center bg-white/5 border border-white/10 p-0.5 rounded-full text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setPreviewLang("en")}
                    className={`px-2 py-0.5 rounded-full transition-all ${
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
                    className={`px-2 py-0.5 rounded-full transition-all ${
                      previewLang === "km"
                        ? "bg-purple-600 text-white shadow font-khmer"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    ខ្មែរ
                  </button>
                </div>
              </div>

              {/* Exact Storefront Card Mockup */}
              <div className="max-w-[240px] mx-auto">
                <div className="group relative rounded-3xl bg-[#141033] border border-white/15 p-3.5 flex flex-col justify-between shadow-2xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/15 rounded-bl-full pointer-events-none" />

                  <div>
                    {/* Cover Art Artwork */}
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-950 mb-3 border border-white/10 shadow-inner">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={previewDisplayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                          <Gamepad2 className="w-8 h-8 mb-1" />
                          <span className="text-[10px]">No Artwork</span>
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-purple-600/90 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider shadow flex items-center gap-1">
                        <GameCurrencyIcon
                          iconType={currencyIcon}
                          className="w-3 h-3"
                        />
                        <span>
                          {previewLang === "km" ? "ភ្លាមៗ" : "Instant"}
                        </span>
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-purple-300/80 uppercase tracking-widest block mb-0.5 truncate">
                      {publisher || "Official"}
                    </span>
                    <h4 className="font-extrabold text-white text-sm line-clamp-1">
                      {previewDisplayName}
                    </h4>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-end text-xs">
                    <span className="text-purple-300 font-bold text-xs flex items-center gap-0.5">
                      {previewLang === "km" ? "បញ្ចូល" : "Reload"}{" "}
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                This shows the real-time storefront card with current settings.
              </p>
            </div>
          </div>
        </form>

        {/* ========================================================================= */}
        {/* 4. PACKAGES & PACKAGE MIXER SECTION (Full Width)                         */}
        {/* ========================================================================= */}
        <div className="rounded-3xl bg-[#141033] border border-white/10 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/10">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                    <span>4. Packages & Package Mixer</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-500/30">
                      {packages.length} Packages
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Manage direct provider tiers and create custom mixed
                    packages (e.g. combine 2 packages into 1 value pack).
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Sync from provider button */}
              <button
                type="button"
                onClick={handleSyncPackages}
                disabled={syncingPackages}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${syncingPackages ? "animate-spin text-purple-400" : ""}`}
                />
                <span>
                  {syncingPackages ? "Syncing..." : "Sync Provider Packages"}
                </span>
              </button>

              {/* Mix Package button linking to dedicated full page */}
              <Link
                href={`/admin/games/${gameId}/packages/new`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 hover:opacity-95 text-xs font-black text-white shadow-lg shadow-purple-600/30 active:scale-98 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Mix Package / Create Custom</span>
              </Link>
            </div>
          </div>

          {/* Sync status alert */}
          {packageMessage && (
            <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center justify-between">
              <span>{packageMessage}</span>
              <button
                onClick={() => setPackageMessage(null)}
                className="text-xs p-1"
              >
                ✕
              </button>
            </div>
          )}

          {/* Packages List */}
          {loadingPackages ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
              <span className="text-xs">Loading game packages...</span>
            </div>
          ) : packages.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02]">
              <Coins className="w-10 h-10 text-slate-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-white">
                No Packages Available
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-4">
                Click &ldquo;Sync Provider Packages&rdquo; to fetch the latest
                diamond tiers from the provider, or &ldquo;Mix Package&rdquo; to
                build your own.
              </p>
              <button
                onClick={handleSyncPackages}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-lg shadow-purple-600/30 transition-all"
              >
                Sync Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {packages.map((pkg) => {
                const cost = parseFloat(pkg.costPriceUsd || "0");
                const price = parseFloat(pkg.priceUsd || "0");
                const profit = price - cost;
                const marginPct =
                  price > 0 ? Math.round((profit / price) * 100) : 0;

                return (
                  <div
                    key={pkg.id}
                    className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      pkg.isComposite
                        ? "bg-gradient-to-b from-purple-900/30 to-[#141033] border-purple-500/40 shadow-lg shadow-purple-500/10"
                        : "bg-white/[0.03] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div>
                      {/* Top: Icon + Title + Type Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <GameCurrencyIcon
                            iconType={currencyIcon}
                            className="w-5 h-5 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-white truncate">
                              {pkg.name}
                            </h4>
                            {pkg.nameKh && (
                              <p className="text-[11px] text-pink-300 font-khmer truncate">
                                {pkg.nameKh}
                              </p>
                            )}
                          </div>
                        </div>

                        {pkg.isComposite ? (
                          <span className="shrink-0 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500/25 to-pink-500/25 text-amber-300 border border-amber-500/40">
                            ⚡ Mixed Pack
                          </span>
                        ) : (
                          <span className="shrink-0 px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-300 border border-sky-500/30">
                            Direct
                          </span>
                        )}
                      </div>

                      {/* Free Diamond / Bonus Badge */}
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <FreeDiamondBadge
                          bonusDiamonds={pkg.bonusDiamonds}
                          badgeText={pkg.badgeText}
                          badgeColor={pkg.badgeColor || "emerald"}
                          size="sm"
                        />
                        {pkg.diamonds ? (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {pkg.diamonds} {currencyName}
                          </span>
                        ) : null}
                      </div>

                      {/* Composite recipe preview */}
                      {pkg.isComposite && pkg.compositeRecipe && (
                        <div className="mb-3 p-2 rounded-xl bg-black/20 border border-white/5 text-[10px] text-slate-400">
                          <span className="font-bold text-purple-300 block mb-0.5">
                            Recipe Composition:
                          </span>
                          {Array.isArray(pkg.compositeRecipe) ? (
                            pkg.compositeRecipe.map((r: any, i: number) => (
                              <span key={i} className="block">
                                • {r.quantity}x {r.name} (${r.priceUsd})
                              </span>
                            ))
                          ) : (
                            <span className="block truncate">
                              {String(pkg.compositeRecipe)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bottom: Pricing & Action Controls */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs mt-2">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-sm font-black text-amber-400">
                            ${pkg.priceUsd}
                          </span>
                          {cost > 0 && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              (Cost: ${cost.toFixed(2)})
                            </span>
                          )}
                        </div>
                        {cost > 0 && (
                          <span className="text-[10px] text-emerald-400 font-bold block">
                            Profit: +${profit.toFixed(2)} ({marginPct}%)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* Edit package on dedicated full page */}
                        <Link
                          href={`/admin/games/${gameId}/packages/${pkg.id}`}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-300 transition-colors"
                          title="Edit package on dedicated page"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>

                        {/* In Stock toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleStock(pkg)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                            pkg.inStock
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-red-500/20 text-red-300 border-red-500/40"
                          }`}
                        >
                          {pkg.inStock ? "In Stock" : "Sold Out"}
                        </button>

                        {/* Delete Package */}
                        <button
                          type="button"
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-300 transition-colors"
                          title="Delete package"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
