"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Zap,
  ShieldCheck,
  Loader2,
  AlertCircle,
  Info,
  Clock,
  Mail,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import {
  fetchGamePackages,
  validatePlayer,
  PlayerValidationResult,
  Game,
  GamePackage,
  GamePackagesResponse,
  createPaymentOrder,
  checkPaymentStatus,
} from "../../../lib/api";
import {
  GameCurrencyIcon,
  FreeDiamondBadge,
  getGameCurrency,
} from "../../../components/game-currency-icons";
import openABAPopup from "../../../lib/aba-payway";
import { useTranslations } from "next-intl";
import { useLanguage } from "../../../context/language-context";
import { getDisplayName } from "../../../lib/i18n";
import Footer from "../../../components/Footer";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { GameDetailSkeleton } from "../../../components/skeletons/game-detail-skeleton";

export default function GameTopupPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id as string;
  const { lang, setLang } = useLanguage();
  const tNav = useTranslations("Navigation");
  const tGame = useTranslations("GameDetail");
  const tCheckout = useTranslations("Checkout");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Game & Packages data
  const [game, setGame] = useState<Game | null>(null);
  const [packages, setPackages] = useState<GamePackage[]>([]);
  const [dynamicFields, setDynamicFields] = useState<
    Array<{ key: string; label: string; type: string }>
  >([]);
  const [currencyInfo, setCurrencyInfo] = useState<{
    currencyName: string;
    currencyIcon: string;
  }>({
    currencyName: "Diamonds",
    currencyIcon: "default_diamond",
  });

  // User input states
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("aba");
  const [contactInfo, setContactInfo] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Player account validation states
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] =
    useState<PlayerValidationResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Step 3 Terms & Conditions acceptance
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Checkout / Success state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<
    "PENDING" | "COMPLETED" | "CANCELLED" | "FAILED"
  >("PENDING");
  const [paymentError, setPaymentError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSuccess || !transactionId) return;

    let attempts = 0;
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const startedAt = Date.now();
    const MAX_POLL_DURATION = 90_000;

    const getDelay = (attempt: number) => {
      if (attempt <= 3) return 2000;
      if (attempt <= 8) return 3000;
      return 5000;
    };

    const poll = async () => {
      if (!isMounted) return;
      attempts += 1;

      try {
        const response = await checkPaymentStatus(transactionId);
        if (!isMounted) return;

        if (response.status === "COMPLETED") {
          setPaymentStatus("COMPLETED");
          return;
        }

        if (response.status === "CANCELLED") {
          setPaymentStatus("CANCELLED");
          return;
        }

        setPaymentStatus("PENDING");
      } catch (err) {
        console.error("Payment status polling failed:", err);
      }

      if (Date.now() - startedAt >= MAX_POLL_DURATION) {
        if (isMounted) setPaymentStatus("FAILED");
        return;
      }

      if (isMounted) {
        timeoutId = setTimeout(poll, getDelay(attempts));
      }
    };

    poll();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isSuccess, transactionId]);

  const handleValidatePlayer = async (
    overrideValues?: Record<string, string>,
  ) => {
    const currentValues = overrideValues || fieldValues;
    const hasValues =
      dynamicFields.length > 0 &&
      dynamicFields.every((f) => currentValues[f.key]?.trim());
    if (!hasValues) {
      setValidationError(tGame("enterAccountCredentials"));
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const res = await validatePlayer(
        rawId,
        currentValues,
        game?.providerCategoryId,
      );
      setValidationResult(res);
      if (!res.valid) {
        setValidationError(res.message || tGame("playerNotFound"));
      }
    } catch (err: unknown) {
      setValidationError(
        err instanceof Error ? err.message : "Failed to validate account",
      );
      setValidationResult(null);
    } finally {
      setIsValidating(false);
    }
  };

  // Debounced auto-validation when all required fields are filled
  useEffect(() => {
    if (!game?.canValidate || dynamicFields.length === 0) return;
    const allFilled = dynamicFields.every((f) => fieldValues[f.key]?.trim());
    if (!allFilled) {
      setValidationResult(null);
      setValidationError(null);
      return;
    }

    const timer = setTimeout(() => {
      handleValidatePlayer();
    }, 700);

    return () => clearTimeout(timer);
  }, [fieldValues, game?.canValidate, dynamicFields]);

  useEffect(() => {
    if (!rawId) return;

    setLoading(true);
    setErrorMessage(null);

    fetchGamePackages(rawId)
      .then((res: GamePackagesResponse) => {
        if (!res?.game) {
          setErrorMessage("Game not found or temporarily unavailable.");
          return;
        }

        setGame(res.game);
        const pkgs = (res.packages || []).filter((p) => p.isActive !== false);
        setPackages(pkgs);

        // Dynamic fields
        if (res.fields && res.fields.length > 0) {
          setDynamicFields(res.fields);
        } else if (res.game.hasZoneId) {
          setDynamicFields([
            { key: "player_id", label: "User ID", type: "text" },
            { key: "server_id", label: "Zone ID", type: "text" },
          ]);
        } else {
          setDynamicFields([
            { key: "player_id", label: "Player ID", type: "text" },
          ]);
        }

        // Currency info
        const initialCurr = getGameCurrency(res.game.slug, res.game.name);
        setCurrencyInfo({
          currencyName: res.game.currencyName || initialCurr.currencyName,
          currencyIcon: res.game.currencyIcon || initialCurr.currencyIcon,
        });
      })
      .catch((err) => {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to load game packages",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [rawId]);

  // Filter packages
  const filteredPackages = packages.filter((pkg) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "mixed") return pkg.isComposite;
    if (activeFilter === "bonus")
      return (pkg.bonusDiamonds && pkg.bonusDiamonds > 0) || pkg.badgeText;
    if (activeFilter === "passes")
      return /pass|elite|twilight|membership/i.test(pkg.name);
    return true;
  });

  const selectedPackage =
    filteredPackages[selectedPackageIndex] ||
    packages[selectedPackageIndex] ||
    packages[0];

  // Step 1: Game ID must be checked and valid (if canValidate is supported), or all fields filled
  const isStep1Complete = Boolean(
    dynamicFields.length > 0 &&
    dynamicFields.every((f) => fieldValues[f.key]?.trim()) &&
    (!game?.canValidate ||
      (validationResult?.valid === true &&
        Boolean(validationResult?.playerName))),
  );

  // Step 2: Package selected
  const isStep2Complete = Boolean(
    selectedPackage && Number(selectedPackage.priceUsd) > 0,
  );

  // Step 3: Checkbox with accept terms & conditions
  const isStep3Complete = acceptedTerms;

  // Can submit only when all 3 steps are complete
  const canSubmit =
    isStep1Complete && isStep2Complete && isStep3Complete && !isProcessing;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Verify Step 1: Check Game ID First
    if (!isStep1Complete) {
      if (game?.canValidate && (!validationResult || !validationResult.valid)) {
        alert(tGame("alertStep1Verify"));
      } else {
        alert(tGame("alertStep1Enter"));
      }
      const el = document.getElementById("step-1-account");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // 2. Verify Step 2: Select Package
    if (!selectedPackage) {
      alert(tGame("alertStep2Select"));
      const el = document.getElementById("step-2-packages");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // 3. Verify Step 3: Checkbox with Accept Terms Condition
    if (!acceptedTerms) {
      alert(tGame("alertStep3Accept"));
      const el = document.getElementById("step-3-terms");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    try {
      setIsProcessing(true);
      setPaymentError(null);

      const paymentOrder = await createPaymentOrder({
        type: "game",
        productId: game?.id || game?.slug || rawId,
        productName: game?.name,
        packageId: selectedPackage.id,
        packageName: selectedPackage.name,
        amount: parseFloat(selectedPackage.priceUsd),
        playerCredentials: fieldValues,
        playerName: validationResult?.playerName || null,
        contactInfo: contactInfo || null,
      });

      if (paymentOrder.paywayPayment) {
        await openABAPopup(paymentOrder.paywayPayment);
        setTransactionId(paymentOrder.tranId);
        setPaymentStatus("PENDING");
      } else {
        throw new Error("ABA PayWay payment data was not returned");
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Payment initialization failed";
      setPaymentError(msg);
      alert(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const gameDisplayName = game ? getDisplayName(game, lang) : "Game Top-Up";

  if (loading) {
    return <GameDetailSkeleton />;
  }

  if (errorMessage || !game) {
    return (
      <div className="min-h-screen bg-[#0b091f] flex flex-col items-center justify-center p-6 text-white">
        <div className="max-w-md w-full rounded-3xl bg-[#141033] border border-red-500/20 p-8 text-center shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-black mb-2">Game Not Found</h2>
          <p className="text-xs text-slate-400 mb-6">
            {errorMessage || "The requested game could not be found."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-lg shadow-purple-600/30"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0b091f] text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR                                                             */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#0d0a27]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2.5 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <Link
              href="/"
              className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex items-center justify-center group shrink-0"
              title="Return to Store"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </Link>

            <Link href="/" className="shrink-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-white/10 shadow-md shadow-purple-500/15 bg-[#0e0c26]">
                <img
                  src="/logo.webp"
                  alt="The Coin Store"
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-purple-400">
                <Link href="/" className="hover:underline">
                  {tNav("store")}
                </Link>
                <span>/</span>
                <span>{tNav("topUp")}</span>
              </div>
              <h1 className="text-sm sm:text-lg font-black text-white truncate leading-tight">
                {gameDisplayName}
              </h1>
            </div>
          </div>

          {/* Right: Language Switcher & Support */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-white/5 border border-white/10 p-0.5 sm:p-1 rounded-full shadow-inner">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 ${
                  lang === "en"
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
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
              >
                <span>🇰🇭</span>
                <span>ខ្មែរ</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO GAME BANNER                                                       */}
      {/* ========================================================================= */}
      <section className="relative w-full bg-gradient-to-b from-[#181242] via-[#100c2a] to-[#0b091f] border-b border-white/10 overflow-hidden">
        {/* Ambient background banner art */}
        {game.bannerUrl ? (
          <div className="absolute inset-0 z-0 opacity-25">
            <img
              src={game.bannerUrl}
              alt=""
              className="w-full h-full object-cover blur-sm scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b091f]/60 via-[#0b091f]/80 to-[#0b091f]" />
          </div>
        ) : (
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex flex-row items-center gap-3.5 sm:gap-5">
            {/* Game Cover Art */}
            <div className="relative w-16 h-16 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl shrink-0 bg-slate-950">
              <img
                src={game.imageUrl}
                alt={gameDisplayName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Game Info */}
            <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
              <h2 className="text-lg sm:text-3xl font-black text-white tracking-tight truncate leading-tight">
                {gameDisplayName}
              </h2>
              {lang === "km" && game.nameKh && game.name !== game.nameKh && (
                <p className="text-[11px] sm:text-xs text-purple-300/80 font-medium truncate">
                  {game.name}
                </p>
              )}

              <p className="text-[11px] sm:text-xs text-slate-400 line-clamp-2 sm:line-clamp-none max-w-xl">
                {game.publisher ? `${game.publisher} • ` : ""}
                {tGame("gameTagline")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. MAIN WORKSPACE GRID                                                    */}
      {/* ========================================================================= */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 w-full flex-1">
        {isSuccess ? (
          /* SUCCESS CONFIRMATION RECEIPT */
          <div className="max-w-xl mx-auto py-8 sm:py-12 px-4 sm:px-6 rounded-2xl sm:rounded-3xl bg-[#141033] border border-emerald-500/30 text-center shadow-2xl shadow-emerald-500/10 animate-in fade-in zoom-in-95 duration-300">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 flex items-center justify-center mx-auto mb-4 sm:mb-5 shadow-lg ${
                paymentStatus === "COMPLETED"
                  ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-emerald-500/20"
                  : paymentStatus === "PENDING"
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-400 shadow-amber-500/20"
                    : "bg-red-500/20 border-red-500/40 text-red-400 shadow-red-500/20"
              }`}
            >
              {paymentStatus === "PENDING" ? (
                <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 animate-spin" />
              ) : paymentStatus === "COMPLETED" ? (
                <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
              ) : (
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
              )}
            </div>

            <span
              className={`px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider border inline-block mb-2 sm:mb-3 ${
                paymentStatus === "COMPLETED"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : paymentStatus === "PENDING"
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                    : "bg-red-500/20 text-red-300 border-red-500/30"
              }`}
            >
              {paymentStatus === "PENDING"
                ? "Verifying payment"
                : paymentStatus === "COMPLETED"
                  ? `✓ ${tCheckout("orderSuccess")}`
                  : "Payment not completed"}
            </span>

            <h3 className="text-xl sm:text-3xl font-black text-white">
              {paymentStatus === "PENDING"
                ? "Processing your payment"
                : paymentStatus === "COMPLETED"
                  ? tGame("rechargeComplete")
                  : "Payment failed"}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-2 max-w-md mx-auto">
              {paymentStatus === "PENDING"
                ? "Keep this page open while we confirm the transaction."
                : paymentStatus === "COMPLETED"
                  ? tGame("rechargeSuccessDesc")
                  : "If you already paid, please contact support with your transaction ID."}
            </p>

            {/* Receipt details */}
            <div className="mt-5 sm:mt-6 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/10 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID:</span>
                <span className="font-mono text-purple-300 font-bold truncate max-w-[180px]">
                  {transactionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Game:</span>
                <span className="font-bold text-white truncate max-w-[180px]">
                  {gameDisplayName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Package:</span>
                <span className="font-bold text-white flex items-center gap-1 truncate max-w-[180px]">
                  <GameCurrencyIcon
                    iconType={currencyInfo.currencyIcon}
                    className="w-3.5 h-3.5 shrink-0"
                  />
                  <span className="truncate">
                    {lang === "km" && selectedPackage?.nameKh
                      ? selectedPackage.nameKh
                      : selectedPackage?.name}
                  </span>
                </span>
              </div>
              {dynamicFields.map((f) => (
                <div key={f.key} className="flex justify-between">
                  <span className="text-slate-400">{f.label}:</span>
                  <span className="font-mono text-white font-bold">
                    {fieldValues[f.key] || "N/A"}
                  </span>
                </div>
              ))}
              {validationResult?.valid && validationResult.playerName && (
                <div className="flex justify-between">
                  <span className="text-slate-400">{tGame("ignLabel")}:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1 font-sans truncate max-w-[180px]">
                    <UserCheck className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {validationResult.playerName}
                    </span>
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-white/10 flex justify-between text-xs sm:text-sm font-black">
                <span className="text-slate-300">Total Paid:</span>
                <span className="text-amber-400">
                  ${selectedPackage?.priceUsd}
                </span>
              </div>
            </div>

            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
              <Link
                href="/"
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-all shadow-lg shadow-purple-600/30"
              >
                {tGame("returnToStore")}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setIsSuccess(false);
                  setPaymentStatus("PENDING");
                  setFieldValues({});
                }}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-bold transition-all"
              >
                {tGame("topUpAgain")}
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleCheckout}
            className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8"
          >
            {/* =================================================================== */}
            {/* LEFT COLUMN: STEPS 1 & 2 (7-8 Cols)                                */}
            {/* =================================================================== */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4 sm:space-y-6">
              {/* STEP 1: ENTER USER ACCOUNT INFO */}
              <div
                id="step-1-account"
                className={`rounded-2xl sm:rounded-3xl bg-[#141033] border p-3.5 sm:p-6 shadow-xl space-y-3.5 sm:space-y-4 transition-all ${
                  isStep1Complete
                    ? "border-emerald-500/40 shadow-emerald-950/20"
                    : "border-white/10"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2 sm:gap-3">
                  <div className="flex items-start sm:items-center gap-2.5 sm:gap-3">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm border transition-all shrink-0 mt-0.5 sm:mt-0 ${
                        isStep1Complete
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-md shadow-emerald-500/20"
                          : "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                      }`}
                    >
                      {isStep1Complete ? (
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                      ) : (
                        "1"
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span>{tGame("step1Title")}</span>
                        {isStep1Complete && (
                          <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            ✓ {tGame("verified")}
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 leading-tight">
                        {tGame("step1Desc")}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`self-start sm:self-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold flex items-center gap-1.5 border transition-all shrink-0 ${
                      isStep1Complete
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isStep1Complete
                          ? "bg-emerald-400"
                          : "bg-amber-400 animate-pulse"
                      }`}
                    />
                    {isStep1Complete
                      ? tGame("idVerified")
                      : tGame("idRequired")}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 pt-1">
                  {dynamicFields.map((field) => (
                    <div key={field.key}>
                      <label className="block text-[11px] sm:text-xs font-bold text-slate-300 mb-1">
                        {field.label} *
                      </label>
                      <input
                        type={field.type || "text"}
                        required
                        value={fieldValues[field.key] || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFieldValues((prev) => ({
                            ...prev,
                            [field.key]: val,
                          }));
                          if (validationResult) {
                            setValidationResult(null);
                          }
                          if (validationError) {
                            setValidationError(null);
                          }
                        }}
                        placeholder={`Enter your ${field.label}`}
                        className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 font-medium font-mono"
                      />
                    </div>
                  ))}
                </div>

                {/* Validation Status / Results Card */}
                {game.canValidate && (
                  <div className="pt-0.5">
                    {isValidating ? (
                      <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-purple-600/10 border border-purple-500/30 flex items-center gap-2.5 sm:gap-3 text-xs text-purple-300 animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400 shrink-0" />
                        <span className="text-[11px] sm:text-xs">
                          {tGame("verifyingAccount")}
                        </span>
                      </div>
                    ) : validationResult?.valid &&
                      validationResult.playerName ? (
                      <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#141033] to-[#0e111a] border border-emerald-500/40 shadow-xl shadow-emerald-950/30 flex items-center justify-between gap-3 animate-in fade-in zoom-in-95">
                        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0 shadow-lg">
                            <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider text-slate-400">
                                {tGame("ignLabel")}
                              </span>
                              <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                                <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                                {tGame("verified")}
                              </span>
                            </div>
                            <h4 className="text-sm sm:text-lg font-black text-white truncate drop-shadow-sm font-sans mt-0.5">
                              {validationResult.playerName}
                            </h4>
                            <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-slate-400 font-mono mt-0.5">
                              {validationResult.playerId && (
                                <span>
                                  ID:{" "}
                                  <strong className="text-purple-300">
                                    {validationResult.playerId}
                                  </strong>
                                </span>
                              )}
                              {validationResult.region && (
                                <span>
                                  Region:{" "}
                                  <strong className="text-slate-300">
                                    {validationResult.region}
                                  </strong>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleValidatePlayer()}
                          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] sm:text-xs font-bold text-slate-300 hover:text-white flex items-center gap-1 shrink-0 transition-all active:scale-95"
                          title="Re-check Account"
                        >
                          <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="hidden sm:inline">
                            {tGame("recheck")}
                          </span>
                        </button>
                      </div>
                    ) : validationError ? (
                      <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start sm:items-center justify-between gap-2.5 text-xs text-rose-300 animate-in fade-in">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          <span className="text-[11px] sm:text-xs">
                            {validationError}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleValidatePlayer()}
                          className="px-2 sm:px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-[10px] sm:text-[11px] font-bold text-rose-200 shrink-0 transition-colors"
                        >
                          {tGame("retry")}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 gap-2">
                        <span className="text-[10px] sm:text-[11px] leading-tight">
                          {tGame("enterIdToVerify")}
                        </span>
                        <button
                          type="button"
                          disabled={isValidating}
                          onClick={() => handleValidatePlayer()}
                          className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>{tGame("checkId")}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Input Guide / Avatar helper */}
                {game.inputGuide && (
                  <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/5 text-[11px] sm:text-xs text-slate-400 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{game.inputGuide}</span>
                  </div>
                )}
              </div>

              {/* STEP 2: SELECT RECHARGE PACKAGE */}
              <div
                id="step-2-packages"
                className={`rounded-2xl sm:rounded-3xl bg-[#141033] border p-3.5 sm:p-6 shadow-xl space-y-3.5 sm:space-y-5 transition-all ${
                  isStep2Complete
                    ? "border-pink-500/40 shadow-pink-950/20"
                    : "border-white/10"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm border transition-all shrink-0 ${
                        isStep2Complete
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-md shadow-emerald-500/20"
                          : "bg-pink-600/20 text-pink-400 border border-pink-500/30"
                      }`}
                    >
                      {isStep2Complete ? (
                        <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
                      ) : (
                        "2"
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <span>{tGame("step2Title")}</span>
                        {isStep2Complete && (
                          <span className="text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                            ✓ {tGame("selected")}
                          </span>
                        )}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-slate-400">
                        {packages.length} {currencyInfo.currencyName}{" "}
                        {tGame("tiersAvailable")}
                      </p>
                    </div>
                  </div>

                  {/* Filter Pills - scrollable on mobile */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 sm:flex-wrap -mx-1 px-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveFilter("all");
                        setSelectedPackageIndex(0);
                      }}
                      className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition-all shrink-0 ${
                        activeFilter === "all"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      {tGame("filterAll")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveFilter("bonus");
                        setSelectedPackageIndex(0);
                      }}
                      className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition-all shrink-0 ${
                        activeFilter === "bonus"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      ✨ {tGame("bonusFilter")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveFilter("mixed");
                        setSelectedPackageIndex(0);
                      }}
                      className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold transition-all shrink-0 ${
                        activeFilter === "mixed"
                          ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                          : "bg-white/5 text-slate-400 hover:text-white"
                      }`}
                    >
                      ⚡ {tGame("bundlesFilter")}
                    </button>
                  </div>
                </div>

                {/* Packages Grid */}
                {filteredPackages.length === 0 ? (
                  <div className="py-10 text-center text-slate-400">
                    <p className="text-xs">
                      No packages match the selected filter.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2.5 sm:gap-3.5">
                    {filteredPackages.map((pkg, idx) => {
                      const isSelected = selectedPackage?.id === pkg.id;
                      const pkgName =
                        lang === "km" && pkg.nameKh ? pkg.nameKh : pkg.name;

                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setSelectedPackageIndex(idx)}
                          className={`group relative p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                            isSelected
                              ? "bg-gradient-to-b from-purple-600/25 via-[#181438] to-purple-900/30 border-purple-400 shadow-xl shadow-purple-500/20 ring-2 ring-purple-400/80 scale-[1.01] sm:scale-[1.02]"
                              : "bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]"
                          }`}
                        >
                          {/* Corner selection indicator */}
                          {isSelected && (
                            <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 bg-purple-500 text-white flex items-center justify-center rounded-bl-xl sm:rounded-bl-2xl shadow">
                              <Check className="w-3 h-3 sm:w-4 sm:h-4 stroke-[3]" />
                            </div>
                          )}

                          {/* Top: Icon + Name */}
                          <div>
                            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                              <GameCurrencyIcon
                                iconType={currencyInfo.currencyIcon}
                                className="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                              />
                              <span className="text-[11px] sm:text-xs md:text-sm font-black text-white line-clamp-1">
                                {pkgName}
                              </span>
                            </div>

                            {/* Free Diamond / Bonus Badge */}
                            {(pkg.bonusDiamonds && pkg.bonusDiamonds > 0) ||
                            pkg.badgeText ? (
                              <div className="mb-1.5 sm:mb-2">
                                <FreeDiamondBadge
                                  bonusDiamonds={pkg.bonusDiamonds}
                                  badgeText={pkg.badgeText}
                                  badgeColor={pkg.badgeColor || "emerald"}
                                  size="sm"
                                />
                              </div>
                            ) : pkg.isComposite ? (
                              <div className="mb-1.5 sm:mb-2">
                                <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                  ⚡ Bundle
                                </span>
                              </div>
                            ) : null}
                          </div>

                          {/* Bottom: Price */}
                          <div className="mt-2.5 sm:mt-3 pt-1.5 sm:pt-2 border-t border-white/10 flex items-baseline justify-between">
                            <span className="text-xs sm:text-base font-black text-amber-400">
                              ${pkg.priceUsd}
                            </span>
                            {pkg.originalPrice && (
                              <span className="text-[9px] sm:text-[10px] text-slate-500 line-through font-mono">
                                ${pkg.originalPrice}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* =================================================================== */}
            {/* RIGHT COLUMN: MERGED PAYMENT METHOD & ORDER SUMMARY                 */}
            {/* =================================================================== */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="sticky top-20 sm:top-24 rounded-2xl sm:rounded-3xl bg-[#141033] border border-white/15 p-3.5 sm:p-5 shadow-2xl space-y-3.5 sm:space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-white">
                      {tGame("paymentAndSummary")}
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-400">
                      {tGame("instantCheckoutSubtitle")}
                    </p>
                  </div>
                  <Badge variant="tourbillon">Official</Badge>
                </div>

                {/* Selected Item & Package Preview */}
                <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/5">
                  <img
                    src={game.imageUrl}
                    alt=""
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-white truncate">
                      {gameDisplayName}
                    </h4>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-[10px] text-purple-300">
                        {game.publisher || "Official"}
                      </span>
                      {selectedPackage && (
                        <span className="text-xs font-black text-amber-400">
                          ${selectedPackage.priceUsd}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Selected Package Breakdown */}
                {selectedPackage && (
                  <div className="space-y-1.5 sm:space-y-2 text-xs p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/[0.02] border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] sm:text-xs text-slate-400">
                        {tGame("selectedTier")}
                      </span>
                      <span className="font-bold text-white flex items-center gap-1 text-[11px] sm:text-xs truncate max-w-[160px]">
                        <GameCurrencyIcon
                          iconType={currencyInfo.currencyIcon}
                          className="w-3.5 h-3.5 shrink-0"
                        />
                        <span className="truncate">
                          {lang === "km" && selectedPackage.nameKh
                            ? selectedPackage.nameKh
                            : selectedPackage.name}
                        </span>
                      </span>
                    </div>

                    {((selectedPackage.bonusDiamonds &&
                      selectedPackage.bonusDiamonds > 0) ||
                      selectedPackage.badgeText) && (
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] sm:text-xs text-slate-400">
                          {tGame("bonusDiamonds")}
                        </span>
                        <FreeDiamondBadge
                          bonusDiamonds={selectedPackage.bonusDiamonds}
                          badgeText={selectedPackage.badgeText}
                          badgeColor={selectedPackage.badgeColor}
                          size="sm"
                        />
                      </div>
                    )}

                    {dynamicFields.map((f) => (
                      <div
                        key={f.key}
                        className="flex items-center justify-between text-[11px] sm:text-xs"
                      >
                        <span className="text-slate-400">{f.label}:</span>
                        <span className="font-mono text-purple-300 font-bold truncate max-w-[140px]">
                          {fieldValues[f.key] || "—"}
                        </span>
                      </div>
                    ))}

                    {validationResult?.valid && validationResult.playerName && (
                      <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px] sm:text-[11px]">
                          <UserCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                          <span>{tGame("verifiedAccountLabel")}</span>
                        </div>
                        <span className="font-black text-white text-[11px] sm:text-xs font-sans truncate max-w-[120px] drop-shadow-sm">
                          {validationResult.playerName}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* PAYMENT METHOD: ONLY ABA PAY */}
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 text-[11px] sm:text-xs">
                      {tGame("paymentMethodLabel")}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-emerald-400 flex items-center gap-1 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {tGame("instantZeroFee")}
                    </span>
                  </div>

                  {/* ABA PAY Card */}
                  <div className="p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border bg-gradient-to-r from-[#055E7C]/25 via-[#0c1f30] to-[#141033] border-[#055E7C]/60 shadow-lg flex items-center justify-between gap-2.5 sm:gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl overflow-hidden shadow-md border border-white/10 shrink-0 flex items-center justify-center">
                        <img
                          src="/aba.svg"
                          alt="ABA Pay"
                          className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-black text-white">
                            ABA PAY
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-[#E1232E] text-white text-[7px] sm:text-[8px] font-black uppercase tracking-wider">
                            Official
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
                          {tGame("abaSubtitle")}
                        </p>
                      </div>
                    </div>

                    <span className="text-[9px] sm:text-[10px] font-bold text-cyan-300 bg-[#055E7C]/40 border border-[#055E7C]/60 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg flex items-center gap-1 shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>{tGame("active")}</span>
                    </span>
                  </div>
                </div>

                {/* Optional Email/Phone Receipt */}
                <div className="space-y-1">
                  <label className="block text-[10px] sm:text-[11px] font-semibold text-slate-400">
                    {tGame("receiptOptional")}
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="e.g. name@email.com or Telegram"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 sm:pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* STEP 3: MANDATORY TERMS & CONDITIONS CHECKBOX */}
                <div
                  id="step-3-terms"
                  role="button"
                  tabIndex={0}
                  onClick={() => setAcceptedTerms(!acceptedTerms)}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      setAcceptedTerms(!acceptedTerms);
                    }
                  }}
                  className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-2.5 sm:gap-3 ${
                    acceptedTerms
                      ? "bg-gradient-to-r from-emerald-950/40 via-[#101b2f] to-[#141033] border-emerald-500/50 shadow-md shadow-emerald-950/20"
                      : "bg-white/[0.03] border-white/10 hover:border-purple-400/50 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="pt-0.5 shrink-0">
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                        acceptedTerms
                          ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-sm shadow-emerald-500/30"
                          : "bg-white/5 border-white/30 text-transparent"
                      }`}
                    >
                      <Check
                        className={`w-3 h-3 stroke-[3] ${
                          acceptedTerms ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2 flex-1">
                    <label className="text-[11px] sm:text-xs font-bold text-white cursor-pointer block leading-tight">
                      {tGame("confirmTermsPrefix")}{" "}
                      <span className="text-amber-400 underline underline-offset-2">
                        {tCheckout("termsOfService")}
                      </span>{" "}
                      {tCheckout("and")}{" "}
                      <span className="text-amber-400 underline underline-offset-2">
                        {tCheckout("refundPolicy")}
                      </span>
                      .
                    </label>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 leading-tight">
                      {tGame("termsNotice")}
                    </p>
                  </div>
                </div>

                {/* Total Due */}
                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs uppercase font-bold text-slate-400">
                    {tGame("totalDue")}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-amber-400">
                    ${selectedPackage?.priceUsd || "0.00"}
                  </span>
                </div>

                {/* Submit / Top Up Button with Dynamic Gated State */}
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className={`w-full h-11 sm:h-12 rounded-xl font-black text-xs shadow-xl transition-all ${
                    canSubmit
                      ? "bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white shadow-purple-600/30 hover:opacity-95 active:scale-98 cursor-pointer"
                      : "bg-white/10 text-slate-400 border border-white/10 cursor-not-allowed opacity-75 shadow-none"
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin text-white" />
                      <span>{tCheckout("processing")}</span>
                    </>
                  ) : !isStep1Complete ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-400 shrink-0" />
                      <span className="truncate">
                        {tCheckout("step1Incomplete")}
                      </span>
                    </>
                  ) : !isStep2Complete ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-400 shrink-0" />
                      <span className="truncate">
                        {tCheckout("step2Incomplete")}
                      </span>
                    </>
                  ) : !isStep3Complete ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-amber-400 shrink-0" />
                      <span className="truncate">
                        {tCheckout("step3Incomplete")}
                      </span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-1.5 fill-current text-amber-300 shrink-0" />
                      <span className="truncate">{tCheckout("topUpNow")}</span>
                    </>
                  )}
                </Button>

                {/* Trust Badges */}
                <div className="pt-1 border-t border-white/5 space-y-1.5 text-[10px] sm:text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                    <span>{tGame("officialSafeBadge")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" />
                    <span>{tGame("instantCreditBadge")}</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
