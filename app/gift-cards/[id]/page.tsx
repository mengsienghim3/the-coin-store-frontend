"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Zap,
  ShieldCheck,
  Sparkles,
  Loader2,
  AlertCircle,
  CreditCard,
  QrCode,
  Gift,
  Mail,
  Clock,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  fetchGiftCard,
  GiftCard,
  createPaymentOrder,
  checkPaymentStatus,
} from "../../../lib/api";
import { useLanguage } from "../../../context/language-context";
import { getDisplayName } from "../../../lib/i18n";
import Footer from "../../../components/Footer";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { GiftCardDetailSkeleton } from "../../../components/skeletons/gift-card-detail-skeleton";
import openABAPopup from "../../../lib/aba-payway";

export default function GiftCardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id as string;
  const { lang, setLang } = useLanguage();
  const tNav = useTranslations("Navigation");
  const tCard = useTranslations("GiftCardDetail");
  const tCheckout = useTranslations("Checkout");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [card, setCard] = useState<GiftCard | null>(null);

  // User input states
  const [recipientEmail, setRecipientEmail] = useState("");
  const [selectedDenomIndex, setSelectedDenomIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"aba">("aba");

  // Checkout / Success state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderCode, setOrderCode] = useState("");
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
          if (!orderCode) {
            const randomCode =
              "CODE-" +
              Math.random().toString(36).substring(2, 6).toUpperCase() +
              "-" +
              Math.random().toString(36).substring(2, 6).toUpperCase();
            setOrderCode(randomCode);
          }
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
  }, [isSuccess, transactionId, orderCode]);

  useEffect(() => {
    if (!rawId) return;

    setLoading(true);
    setErrorMessage(null);

    fetchGiftCard(rawId)
      .then((data) => {
        if (!data) {
          setErrorMessage("Gift card not found.");
          return;
        }
        setCard(data);
      })
      .catch((err) => {
        setErrorMessage(
          err instanceof Error ? err.message : "Failed to load gift card",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, [rawId]);

  const denoms = card?.denominations || [
    { label: "$10 Gift Code", price: "$10.00" },
    { label: "$25 Gift Code", price: "$25.00" },
    { label: "$50 Gift Code", price: "$50.00" },
    { label: "$100 Gift Code", price: "$100.00" },
  ];

  const selectedDenom = denoms[selectedDenomIndex] || denoms[0];

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim()) {
      alert("Please enter a recipient email address for the digital code.");
      return;
    }

    try {
      setIsProcessing(true);
      setPaymentError(null);

      const numericPrice =
        parseFloat(selectedDenom.price.replace(/[^0-9.]/g, "")) || 10.0;

      const paymentOrder = await createPaymentOrder({
        type: "gift_card",
        productId: card?.id || card?.slug || rawId,
        productName: card?.name,
        packageId: `denom_${selectedDenomIndex}`,
        packageName: selectedDenom.label,
        amount: numericPrice,
        contactInfo: recipientEmail.trim(),
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

  const cardDisplayName = card
    ? getDisplayName(card, lang)
    : "Digital Gift Card";

  if (loading) {
    return <GiftCardDetailSkeleton />;
  }

  if (errorMessage || !card) {
    return (
      <div className="min-h-screen bg-[#0b091f] flex flex-col items-center justify-center p-6 text-white">
        <div className="max-w-md w-full rounded-3xl bg-[#141033] border border-red-500/20 p-8 text-center shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-black mb-2">Card Not Found</h2>
          <p className="text-xs text-slate-400 mb-6">{errorMessage}</p>
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
    <div className="min-h-screen flex flex-col bg-[#0b091f] text-slate-100 selection:bg-pink-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0d0a27]/90 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <Link
              href="/"
              className="p-1.5 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex items-center justify-center group shrink-0"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/"
              className="hidden sm:flex items-center gap-2 pr-2 border-r border-white/10 shrink-0"
            >
              <img
                src="/logo.webp"
                alt="The Coin Store"
                className="w-8 h-8 rounded-lg object-contain shadow-md"
              />
            </Link>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-pink-400">
                <Link href="/" className="hover:underline">
                  {tNav("store")}
                </Link>
                <span>/</span>
                <span>{tNav("giftCards")}</span>
              </div>
              <h1 className="text-sm sm:text-lg font-black text-white truncate leading-tight">
                {cardDisplayName}
              </h1>
            </div>
          </div>

          <div className="flex items-center bg-white/5 border border-white/10 p-0.5 sm:p-1 rounded-full shadow-inner shrink-0">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all ${
                lang === "en"
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🇬🇧 EN
            </button>
            <button
              type="button"
              onClick={() => setLang("km")}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all ${
                lang === "km"
                  ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md shadow-purple-600/30 font-khmer"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              🇰🇭 ខ្មែរ
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 w-full flex-1">
        {isSuccess ? (
          <div className="max-w-xl mx-auto py-8 sm:py-12 px-4 sm:px-6 rounded-2xl sm:rounded-3xl bg-[#141033] border border-emerald-500/30 text-center shadow-2xl shadow-emerald-500/10">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 flex items-center justify-center mx-auto mb-4 sm:mb-5 ${
              paymentStatus === "COMPLETED"
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                : paymentStatus === "PENDING"
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : "bg-red-500/20 border-red-500/40 text-red-400"
            }`}>
              {paymentStatus === "PENDING" ? (
                <RefreshCw className="w-8 h-8 sm:w-10 sm:h-10 animate-spin" />
              ) : paymentStatus === "COMPLETED" ? (
                <Check className="w-8 h-8 sm:w-10 sm:h-10 stroke-[3]" />
              ) : (
                <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" />
              )}
            </div>
            <h3 className="text-xl sm:text-3xl font-black text-white">
              {paymentStatus === "PENDING"
                ? "Verifying payment"
                : paymentStatus === "COMPLETED"
                  ? "Code Purchased Successfully!"
                  : "Payment failed"}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-2 max-w-md mx-auto">
              {paymentStatus === "PENDING"
                ? "Keep this page open while we confirm the transaction."
                : paymentStatus === "COMPLETED"
                  ? `Your digital gift code has been generated and sent to ${recipientEmail}.`
                  : "If you already paid, please contact support with your transaction ID."}
            </p>

            <div className="mt-5 sm:mt-6 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-black/40 border border-white/10 text-center">
              <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase font-bold tracking-widest block mb-1">
                {paymentStatus === "COMPLETED"
                  ? "Your Digital Redeem Code"
                  : "Transaction ID"}
              </span>
              <span className="text-base sm:text-lg font-mono font-black text-pink-400 tracking-wider">
                {paymentStatus === "COMPLETED" ? orderCode : transactionId}
              </span>
            </div>

            <div className="mt-5 sm:mt-6 flex justify-center gap-3">
              <Link
                href="/"
                className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-all shadow-lg"
              >
                Return to Store
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleCheckout}
            className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8"
          >
            <div className="lg:col-span-8 space-y-4 sm:space-y-6">
              {/* Step 1: Email */}
              <div className="rounded-2xl sm:rounded-3xl bg-[#141033] border border-white/10 p-3.5 sm:p-6 shadow-xl space-y-3.5 sm:space-y-4">
                <div className="flex items-center gap-2.5 sm:gap-3 pb-3 border-b border-white/10">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center font-black text-xs sm:text-sm border border-pink-500/30 shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-white">
                      Recipient Delivery Information
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-400">
                      We will deliver the redeem code instantly to this email
                      address.
                    </p>
                  </div>
                </div>

                <div className="relative pt-0.5">
                  <Mail className="w-4 h-4 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="Enter your email address (e.g. name@example.com)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>

              {/* Step 2: Denomination */}
              <div className="rounded-2xl sm:rounded-3xl bg-[#141033] border border-white/10 p-3.5 sm:p-6 shadow-xl space-y-3.5 sm:space-y-4">
                <div className="flex items-center gap-2.5 sm:gap-3 pb-3 border-b border-white/10">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-black text-xs sm:text-sm border border-purple-500/30 shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-white">
                      Select Card Denomination
                    </h3>
                    <p className="text-[10px] sm:text-[11px] text-slate-400">
                      Choose the amount you want to purchase.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5 pt-0.5">
                  {denoms.map((d, idx) => {
                    const isSelected = selectedDenomIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedDenomIndex(idx)}
                        className={`p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-pink-600/20 border-pink-400 shadow-xl shadow-pink-500/20 ring-2 ring-pink-400 scale-[1.01] sm:scale-[1.02]"
                            : "bg-white/[0.03] border-white/10 hover:border-white/20"
                        }`}
                      >
                        <span className="text-[11px] sm:text-xs font-bold text-white block mb-1">
                          {d.label}
                        </span>
                        <span className="text-xs sm:text-base font-black text-amber-400">
                          {d.price}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Payment Method (ONLY ABA PAY) */}
              <div className="rounded-2xl sm:rounded-3xl bg-[#141033] border border-white/10 p-3.5 sm:p-6 shadow-xl space-y-3.5 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2 sm:gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-black text-xs sm:text-sm border border-amber-500/30 shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-white">
                        {tCheckout("paymentMethod")} (ABA PAY)
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-slate-400">
                        {tCard("automatedPaymentDesc")}
                      </p>
                    </div>
                  </div>

                  <span className="self-start sm:self-center px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[9px] sm:text-[10px] font-bold flex items-center gap-1.5 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {tCard("automatedDelivery")}
                  </span>
                </div>

                {/* ABA PAY Card */}
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border bg-gradient-to-r from-[#055E7C]/25 via-[#0c1f30] to-[#141033] border-[#055E7C]/60 shadow-xl shadow-cyan-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-2.5 sm:gap-3.5">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg border border-white/10 shrink-0 bg-[#055E7C] flex items-center justify-center">
                      <img
                        src="/aba.svg"
                        alt="ABA Pay"
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-sm sm:text-base font-black text-white">
                          ABA PAY
                        </span>
                        <span className="px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-md bg-[#E1232E] text-white text-[7px] sm:text-[9px] font-black uppercase tracking-wider">
                          Official
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-300 mt-0.5">
                        {tCheckout("abaPaySubtitle")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-[10px] sm:text-[11px] font-bold text-cyan-300 bg-[#055E7C]/40 border border-[#055E7C]/60 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl flex items-center gap-1 sm:gap-1.5">
                      <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>{tCard("selected")}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Summary */}
            <div className="lg:col-span-4">
              <div className="sticky top-20 sm:top-24 rounded-2xl sm:rounded-3xl bg-[#141033] border border-white/15 p-3.5 sm:p-5 shadow-2xl space-y-3.5 sm:space-y-4">
                <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/[0.03] border border-white/5">
                  <img
                    src={card.imageUrl}
                    alt=""
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border border-white/10 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-white truncate">
                      {cardDisplayName}
                    </h4>
                    <span className="text-[10px] text-pink-400 font-medium block truncate">
                      {card.brand || "Digital Gift Card"}
                    </span>
                  </div>
                </div>

                {/* Order Details Breakdown */}
                <div className="pt-2 border-t border-white/10 space-y-1.5 sm:space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px] sm:text-xs">
                    <span className="text-slate-400">Card Amount:</span>
                    <span className="font-bold text-white">
                      {selectedDenom?.label}
                    </span>
                  </div>

                  {recipientEmail && (
                    <div className="flex items-center justify-between text-[11px] sm:text-xs">
                      <span className="text-slate-400">Email:</span>
                      <span className="font-mono text-pink-300 truncate max-w-[150px]">
                        {recipientEmail}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] sm:text-xs">
                    <span className="text-slate-400">Payment:</span>
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <img
                        src="/aba.svg"
                        alt="ABA PAY"
                        className="w-4 h-4 rounded"
                      />
                      ABA PAY
                    </span>
                  </div>
                </div>

                <div className="pt-2 sm:pt-3 border-t border-white/10 flex items-center justify-between">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase">
                    {tCheckout("totalDue")}:
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-amber-400">
                    {selectedDenom?.price}
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-r from-pink-600 via-purple-600 to-amber-500 text-white font-black text-xs sm:text-sm shadow-xl hover:opacity-95"
                >
                  {isProcessing ? tCheckout("processing") : tCard("buyButton")}
                </Button>

                {/* Trust Badges */}
                <div className="pt-1 border-t border-white/5 space-y-1.5 text-[10px] sm:text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
                    <span>{tCard("genuineBadge")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 shrink-0" />
                    <span>{tCard("instantEmailBadge")}</span>
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
