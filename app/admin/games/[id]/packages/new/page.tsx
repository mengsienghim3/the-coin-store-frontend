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
  PackagePlus,
  HelpCircle,
} from "lucide-react";
import {
  fetchGame,
  fetchGamePackages,
  createGamePackage,
  getStoredAdmin,
  clearStoredAdmin,
  verifyAdminSession,
  Game,
} from "../../../../../../lib/api";
import {
  GameCurrencyIcon,
  FreeDiamondBadge,
  getGameCurrency,
} from "../../../../../../components/game-currency-icons";

export default function NewPackageMixerPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Game data
  const [game, setGame] = useState<Game | null>(null);
  const [providerPackages, setProviderPackages] = useState<
    Array<{
      id: string;
      name: string;
      priceUsd: number;
      retailPriceUsd?: number;
    }>
  >([]);

  // Mode: "mix" | "manual"
  const [mode, setMode] = useState<"mix" | "manual">("mix");

  // Ingredient 1
  const [pkg1Id, setPkg1Id] = useState("");
  const [pkg1Qty, setPkg1Qty] = useState(1);

  // Ingredient 2
  const [pkg2Id, setPkg2Id] = useState("");
  const [pkg2Qty, setPkg2Qty] = useState(1);

  // Custom Package Fields
  const [name, setName] = useState("");
  const [nameKh, setNameKh] = useState("");
  const [diamonds, setDiamonds] = useState<number>(0);
  const [bonusDiamonds, setBonusDiamonds] = useState<number>(0);
  const [badgeText, setBadgeText] = useState("+2 Free Bonus");
  const [badgeColor, setBadgeColor] = useState("emerald");
  const [costPriceUsd, setCostPriceUsd] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [order, setOrder] = useState(1);
  const [inStock, setInStock] = useState(true);

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

    if (gameId) {
      Promise.all([fetchGame(gameId), fetchGamePackages(gameId)])
        .then(([gameData, pkgData]) => {
          if (!gameData) {
            setErrorMessage("Game not found.");
            return;
          }
          setGame(gameData);
          if (pkgData?.providerPackages) {
            setProviderPackages(pkgData.providerPackages);
            // Default select first provider package if available
            if (pkgData.providerPackages.length > 0) {
              setPkg1Id(pkgData.providerPackages[0].id);
              setPkg1Qty(2); // Default to 2x for mixing
            }
          }
        })
        .catch((err) => {
          setErrorMessage(
            err instanceof Error ? err.message : "Failed to load game info",
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [gameId, router]);

  const currencyInfo = game
    ? getGameCurrency(game.slug, game.name)
    : { currencyName: "Diamonds", currencyIcon: "mlbb_diamond" };

  // Auto-calculate combined ingredients
  useEffect(() => {
    if (mode !== "mix") return;

    const p1 = providerPackages.find((p) => p.id === pkg1Id);
    const p2 = providerPackages.find((p) => p.id === pkg2Id);

    let totalCost = 0;
    let totalSuggested = 0;
    let totalDiamonds = 0;
    const names: string[] = [];

    if (p1 && pkg1Qty > 0) {
      totalCost += p1.priceUsd * pkg1Qty;
      totalSuggested += (p1.retailPriceUsd || p1.priceUsd) * pkg1Qty;
      const match = p1.name.match(/(\d+)/);
      if (match) totalDiamonds += parseInt(match[1], 10) * pkg1Qty;
      names.push(pkg1Qty > 1 ? `${pkg1Qty}x ${p1.name}` : p1.name);
    }

    if (p2 && pkg2Qty > 0) {
      totalCost += p2.priceUsd * pkg2Qty;
      totalSuggested += (p2.retailPriceUsd || p2.priceUsd) * pkg2Qty;
      const match = p2.name.match(/(\d+)/);
      if (match) totalDiamonds += parseInt(match[1], 10) * pkg2Qty;
      names.push(pkg2Qty > 1 ? `${pkg2Qty}x ${p2.name}` : p2.name);
    }

    if (totalCost > 0) {
      setCostPriceUsd(totalCost.toFixed(2));
    }
    if (totalSuggested > 0 && !priceUsd) {
      setPriceUsd(totalSuggested.toFixed(2));
    }
    if (totalDiamonds > 0 && (!diamonds || diamonds === 0)) {
      setDiamonds(totalDiamonds);
    }
    if (names.length > 0 && !name) {
      setName(
        `${totalDiamonds || "Special"} ${currencyInfo.currencyName} (${names.join(" + ")})`,
      );
    }
  }, [pkg1Id, pkg1Qty, pkg2Id, pkg2Qty, mode, providerPackages]);

  // Handle Submit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId || !name.trim() || !priceUsd.trim()) {
      alert("Please provide a name and selling price for this package");
      return;
    }

    setSaving(true);
    setErrorMessage(null);

    try {
      const recipe: any[] = [];
      if (mode === "mix") {
        const p1 = providerPackages.find((p) => p.id === pkg1Id);
        if (p1 && pkg1Qty > 0) {
          recipe.push({
            packageId: p1.id,
            name: p1.name,
            priceUsd: p1.priceUsd,
            quantity: pkg1Qty,
          });
        }
        const p2 = providerPackages.find((p) => p.id === pkg2Id);
        if (p2 && pkg2Qty > 0) {
          recipe.push({
            packageId: p2.id,
            name: p2.name,
            priceUsd: p2.priceUsd,
            quantity: pkg2Qty,
          });
        }
      }

      await createGamePackage(gameId, {
        name: name.trim(),
        nameKh: nameKh.trim() || null,
        diamonds: diamonds || 0,
        bonusDiamonds: bonusDiamonds || 0,
        badgeText: badgeText.trim() || null,
        badgeColor: badgeColor || "emerald",
        priceUsd: priceUsd.trim(),
        costPriceUsd: costPriceUsd.trim() || null,
        isComposite: recipe.length > 0,
        compositeRecipe: recipe.length > 0 ? recipe : null,
        inStock,
        order: Number(order),
        isActive: true,
      });

      // Navigate back to dedicated game editor page
      router.push(`/admin/games/${gameId}`);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to create package",
      );
      setSaving(false);
    }
  };

  const cost = parseFloat(costPriceUsd || "0");
  const price = parseFloat(priceUsd || "0");
  const profit = price - cost;
  const marginPct = price > 0 ? Math.round((profit / price) * 100) : 0;

  const previewTitle =
    previewLang === "km" && nameKh.trim()
      ? nameKh.trim()
      : name || "Package Name";

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b091f] flex flex-col items-center justify-center p-6 text-white">
        <Loader2 className="w-10 h-10 text-purple-400 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-300">
          Loading package mixer...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b091f] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white pb-24">
      {/* 1. Header */}
      <header className="sticky top-0 z-40 bg-[#0d0a27]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href={`/admin/games/${gameId}`}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex items-center justify-center group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">
                  {game?.name || "Game"} / Package Mixer
                </span>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  <GameCurrencyIcon
                    iconType={currencyInfo.currencyIcon}
                    className="w-3 h-3"
                  />
                  <span>{currencyInfo.currencyName}</span>
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-white truncate">
                Create & Mix Custom Package
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href={`/admin/games/${gameId}`}
              className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white"
            >
              Cancel
            </Link>

            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 hover:opacity-95 text-white text-xs font-black shadow-lg shadow-purple-600/30 active:scale-98 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Package...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current" />
                  <span>Publish Package</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Error Alert */}
      {errorMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-4">
          <div className="p-4 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 flex items-center justify-between text-xs font-bold">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)}>✕</button>
          </div>
        </div>
      )}

      {/* 2. Main Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 w-full flex-1">
        <form
          onSubmit={handleSave}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8"
        >
          {/* Left Column: Form Controls (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card: Mode Selector */}
            <div className="rounded-3xl bg-[#141033] border border-white/10 p-6 shadow-xl">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300 block mb-3">
                Select Package Creation Mode
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode("mix")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    mode === "mix"
                      ? "bg-gradient-to-r from-purple-600/25 to-pink-600/25 border-purple-400 ring-1 ring-purple-400 shadow-lg"
                      : "bg-white/[0.03] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span className="text-xs font-black text-white">
                      ⚡ Package Mixer (Recommended)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Mix 2 provider packages (e.g. 2x 14 Diamonds = 28 Diamonds)
                    with auto cost & margin calculation.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setMode("manual")}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    mode === "manual"
                      ? "bg-gradient-to-r from-purple-600/25 to-pink-600/25 border-purple-400 ring-1 ring-purple-400 shadow-lg"
                      : "bg-white/[0.03] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <PackagePlus className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-black text-white">
                      Custom Package
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Create an arbitrary package with custom pricing and diamond
                    amounts.
                  </p>
                </button>
              </div>
            </div>

            {/* Card: Recipe Ingredients (If Mode = Mix) */}
            {mode === "mix" && (
              <div className="rounded-3xl bg-[#141033] border border-white/10 p-6 sm:p-7 shadow-xl space-y-5">
                <div className="pb-3 border-b border-white/10">
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span>Mixer Ingredients (Combine Provider Packages)</span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select 1 or 2 underlying packages that make up this custom
                    package bundle.
                  </p>
                </div>

                {/* Ingredient 1 */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-300">
                      Ingredient 1: Underlying Package *
                    </span>
                    <span className="text-[10px] text-slate-500">Required</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-3">
                      <select
                        value={pkg1Id}
                        onChange={(e) => setPkg1Id(e.target.value)}
                        className="w-full bg-[#1b1646] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-400"
                      >
                        <option value="">
                          -- Choose Provider Package A --
                        </option>
                        {providerPackages.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Wholesale: ${p.priceUsd} | Retail: $
                            {p.retailPriceUsd || p.priceUsd})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                        <span className="text-[11px] text-slate-400">
                          Quantity:
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={pkg1Qty}
                          onChange={(e) =>
                            setPkg1Qty(
                              Math.max(1, parseInt(e.target.value, 10) || 1),
                            )
                          }
                          className="w-full bg-transparent text-xs font-mono text-white text-center focus:outline-none font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ingredient 2 */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-pink-300">
                      Ingredient 2: Combine With Second Package (Optional)
                    </span>
                    <span className="text-[10px] text-slate-500">Optional</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="sm:col-span-3">
                      <select
                        value={pkg2Id}
                        onChange={(e) => setPkg2Id(e.target.value)}
                        className="w-full bg-[#1b1646] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-pink-400"
                      >
                        <option value="">
                          -- None (Single package multiplier) --
                        </option>
                        {providerPackages.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Wholesale: ${p.priceUsd} | Retail: $
                            {p.retailPriceUsd || p.priceUsd})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
                        <span className="text-[11px] text-slate-400">
                          Quantity:
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={pkg2Qty}
                          onChange={(e) =>
                            setPkg2Qty(
                              Math.max(1, parseInt(e.target.value, 10) || 1),
                            )
                          }
                          className="w-full bg-transparent text-xs font-mono text-white text-center focus:outline-none font-bold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Card: Package Identity & Bilingual Naming */}
            <div className="rounded-3xl bg-[#141033] border border-white/10 p-6 sm:p-7 shadow-xl space-y-4">
              <h3 className="text-sm font-extrabold text-white pb-3 border-b border-white/10">
                Package Identity & Bilingual Naming
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Package Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. 28 Diamonds (Value Pack)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    🇰🇭 Package Name (Khmer ខ្មែរ)
                  </label>
                  <input
                    type="text"
                    value={nameKh}
                    onChange={(e) => setNameKh(e.target.value)}
                    placeholder="e.g. ពេជ្រ ២៨ (កញ្ចប់ពិសេស)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-pink-400 font-khmer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Base Currency Amount ({currencyInfo.currencyName})
                </label>
                <input
                  type="number"
                  min={0}
                  value={diamonds}
                  onChange={(e) =>
                    setDiamonds(parseInt(e.target.value, 10) || 0)
                  }
                  placeholder="28"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            {/* Card: Free Diamonds & Badge Styling */}
            <div className="rounded-3xl bg-[#141033] border border-white/10 p-6 sm:p-7 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Free Diamonds & Badge Styling</span>
                </h3>
                <FreeDiamondBadge
                  bonusDiamonds={bonusDiamonds}
                  badgeText={badgeText}
                  badgeColor={badgeColor}
                  size="md"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Bonus Free Diamonds Amount
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={bonusDiamonds}
                    onChange={(e) =>
                      setBonusDiamonds(parseInt(e.target.value, 10) || 0)
                    }
                    placeholder="e.g. 2"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Badge Display Text
                  </label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    placeholder="e.g. +2 Free Bonus"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Badge Glow Color Theme
                  </label>
                  <select
                    value={badgeColor}
                    onChange={(e) => setBadgeColor(e.target.value)}
                    className="w-full bg-[#1b1646] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="emerald">Emerald (Green Glow)</option>
                    <option value="pink">Pink / Rose Glow</option>
                    <option value="amber">Amber / Gold Glow</option>
                    <option value="purple">Purple / VIP Glow</option>
                    <option value="cyan">Cyan / Ice Glow</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Card: Pricing, Profit Margin, & Display Order */}
            <div className="rounded-3xl bg-[#141033] border border-white/10 p-6 sm:p-7 shadow-xl space-y-4">
              <h3 className="text-sm font-extrabold text-white pb-3 border-b border-white/10">
                Pricing, Profit Margin & Display Controls
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Wholesale Cost ($USD)
                  </label>
                  <input
                    type="text"
                    value={costPriceUsd}
                    onChange={(e) => setCostPriceUsd(e.target.value)}
                    placeholder="0.50"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-300 font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-300 mb-1.5">
                    Selling Price ($USD) *
                  </label>
                  <input
                    type="text"
                    required
                    value={priceUsd}
                    onChange={(e) => setPriceUsd(e.target.value)}
                    placeholder="0.55"
                    className="w-full bg-purple-900/30 border border-purple-500/40 rounded-xl px-4 py-2.5 text-xs text-amber-400 font-mono font-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Display Sort Order
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) =>
                      setOrder(parseInt(e.target.value, 10) || 1)
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono text-center focus:outline-none"
                  />
                </div>
              </div>

              {/* Profit preview pill */}
              {cost > 0 && price > 0 && (
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                  <span className="text-slate-300">
                    Estimated Profit per Sale:
                  </span>
                  <span className="font-bold text-emerald-400">
                    +${profit.toFixed(2)} USD ({marginPct}% Margin)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Live Storefront Card Preview (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 rounded-3xl bg-[#141033] border border-white/10 p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-pink-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                    Live Storefront Card
                  </h3>
                </div>

                {/* Preview Language Toggle */}
                <div className="flex items-center bg-white/5 border border-white/10 p-0.5 rounded-full text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setPreviewLang("en")}
                    className={`px-2 py-0.5 rounded-full ${
                      previewLang === "en"
                        ? "bg-purple-600 text-white"
                        : "text-slate-400"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewLang("km")}
                    className={`px-2 py-0.5 rounded-full ${
                      previewLang === "km"
                        ? "bg-purple-600 text-white font-khmer"
                        : "text-slate-400"
                    }`}
                  >
                    ខ្មែរ
                  </button>
                </div>
              </div>

              {/* Exact Card Preview */}
              <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-600/20 via-[#181438] to-purple-900/30 border-2 border-purple-400 shadow-xl shadow-purple-500/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <GameCurrencyIcon
                      iconType={currencyInfo.currencyIcon}
                      className="w-6 h-6 shrink-0"
                    />
                    <span className="text-sm font-black text-white line-clamp-1">
                      {previewTitle}
                    </span>
                  </div>

                  <div className="mb-3">
                    <FreeDiamondBadge
                      bonusDiamonds={bonusDiamonds}
                      badgeText={badgeText}
                      badgeColor={badgeColor}
                      size="md"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-baseline justify-between">
                  <span className="text-lg font-black text-amber-400">
                    ${priceUsd || "0.00"}
                  </span>
                  <span className="text-xs text-purple-300 font-bold">
                    ⚡ {mode === "mix" ? "Mixed Pack" : "Custom"}
                  </span>
                </div>
              </div>

              {/* Recipe Breakdown info */}
              {mode === "mix" && (pkg1Id || pkg2Id) && (
                <div className="p-3 rounded-2xl bg-black/30 border border-white/5 text-xs text-slate-400 space-y-1.5">
                  <span className="font-bold text-purple-300 block">
                    Recipe Ingredients:
                  </span>
                  {pkg1Id && (
                    <p className="text-[11px]">
                      • {pkg1Qty}x{" "}
                      {providerPackages.find((p) => p.id === pkg1Id)?.name}
                    </p>
                  )}
                  {pkg2Id && (
                    <p className="text-[11px]">
                      • {pkg2Qty}x{" "}
                      {providerPackages.find((p) => p.id === pkg2Id)?.name}
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white font-black text-xs shadow-xl shadow-purple-600/30 hover:opacity-95 flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                {saving ? "Saving..." : "Save & Publish Package"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
