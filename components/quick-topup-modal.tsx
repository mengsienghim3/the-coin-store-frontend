"use client";

import React, { useState, useEffect } from "react";
import { Game, GiftCard, fetchGamePackages, GamePackage } from "../lib/api";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useLanguage } from "../context/language-context";
import { getDisplayName } from "../lib/i18n";
import {
  GameCurrencyIcon,
  FreeDiamondBadge,
  getGameCurrency,
} from "./game-currency-icons";
import {
  Zap,
  X,
  ShieldCheck,
  Mail,
  Check,
  CreditCard,
  Sparkles,
  Loader2,
  Package,
} from "lucide-react";

interface QuickTopupModalProps {
  item: (Game | GiftCard) | null;
  itemType: "game" | "giftcard";
  onClose: () => void;
}

export function QuickTopupModal({
  item,
  itemType,
  onClose,
}: QuickTopupModalProps) {
  const { lang, t } = useLanguage();
  const [recipientEmail, setRecipientEmail] = useState("");
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"khqr" | "aba" | "card">(
    "khqr",
  );
  const [isSuccess, setIsSuccess] = useState(false);

  // Dynamic game packages & account fields
  const [packages, setPackages] = useState<GamePackage[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [currencyInfo, setCurrencyInfo] = useState<{
    currencyName: string;
    currencyIcon: string;
  }>({
    currencyName: "Diamonds",
    currencyIcon: "default_diamond",
  });
  const [dynamicFields, setDynamicFields] = useState<
    Array<{ key: string; label: string; type: string }>
  >([]);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const isGame = itemType === "game";
  const game = isGame ? (item as Game) : null;
  const giftCard = !isGame ? (item as GiftCard) : null;

  // Fetch real game packages from API
  useEffect(() => {
    if (!item) return;

    if (isGame && game) {
      // Set initial currency based on game slug/name
      const initialCurr = getGameCurrency(game.slug, game.name);
      setCurrencyInfo(initialCurr);

      // Default fields
      const defaultFields = game.hasZoneId
        ? [
            { key: "player_id", label: "User ID", type: "text" },
            { key: "server_id", label: "Zone ID", type: "text" },
          ]
        : [{ key: "player_id", label: "Player ID", type: "text" }];
      setDynamicFields(defaultFields);

      setLoadingPackages(true);
      fetchGamePackages(game.slug || game.id)
        .then((res) => {
          if (res?.packages && res.packages.length > 0) {
            setPackages(res.packages.filter((p) => p.isActive !== false));
          }
          if (res?.fields && res.fields.length > 0) {
            setDynamicFields(res.fields);
          }
          if (res?.game?.currencyName || res?.game?.currencyIcon) {
            setCurrencyInfo({
              currencyName: res.game.currencyName || initialCurr.currencyName,
              currencyIcon: res.game.currencyIcon || initialCurr.currencyIcon,
            });
          }
        })
        .catch((err) => {
          console.warn("Failed to load dynamic packages:", err);
          setPackages([]);
        })
        .finally(() => {
          setLoadingPackages(false);
        });
    }
  }, [item, isGame, game?.id, game?.slug]);

  if (!item) return null;

  // Gift card denominations
  const giftCardTiers = (giftCard?.denominations || []).map((d, i) => ({
    id: `gift_tier_${i}`,
    amount: d.label,
    price: d.price,
    bonus: t.digitalCodeBadge,
  }));

  // Active list of tiers
  const currentPackages = isGame ? packages : [];
  const hasLivePackages = isGame && currentPackages.length > 0;

  const currentPrice = isGame
    ? hasLivePackages
      ? `$${currentPackages[selectedTierIndex]?.priceUsd || "0.00"}`
      : "$0.00"
    : giftCardTiers[selectedTierIndex]?.price || "$0.00";

  const hasAvailableTier = isGame ? hasLivePackages : giftCardTiers.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl bg-gradient-to-b from-[#181438] via-[#120f2c] to-[#0a081a] border border-purple-500/25 p-5 sm:p-7 shadow-2xl shadow-purple-500/15 overflow-hidden">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-1.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white">
              {isGame ? t.successTitleGame : t.successTitleGiftCard}
            </h3>
            <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
              {isGame ? t.successDescGame : t.successDescGiftCard}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar"
          >
            {/* Header / Item Info */}
            <div className="flex items-center gap-3.5 pb-3.5 border-b border-white/10">
              <img
                src={item.imageUrl}
                alt={getDisplayName(item, lang)}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-white/10 shadow-lg shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="tourbillon">
                    {isGame ? t.instantBadge : t.digitalCodeBadge}
                  </Badge>
                  {isGame && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                      <GameCurrencyIcon
                        iconType={currencyInfo.currencyIcon}
                        className="w-3.5 h-3.5"
                      />
                      <span>{currencyInfo.currencyName}</span>
                    </span>
                  )}
                </div>
                <h3 className="text-lg sm:text-xl font-black text-white truncate">
                  {getDisplayName(item, lang)}
                </h3>
                <span className="text-xs text-purple-300 font-medium truncate block">
                  {isGame ? game?.publisher || "Official" : giftCard?.brand} •{" "}
                  {isGame ? game?.category : giftCard?.region}
                </span>
              </div>
            </div>

            {/* Step 1: Input target player info */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                {isGame ? t.step1Game : t.step1GiftCard}
              </label>

              {isGame ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {dynamicFields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          {field.label} *
                        </label>
                        <input
                          type={field.type || "text"}
                          required
                          value={fieldValues[field.key] || ""}
                          onChange={(e) =>
                            setFieldValues((prev) => ({
                              ...prev,
                              [field.key]: e.target.value,
                            }))
                          }
                          placeholder={`Enter ${field.label}`}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Input Guide */}
                  {game?.inputGuide && (
                    <p className="text-[11px] text-slate-400 bg-white/[0.03] border border-white/5 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                      <span className="text-purple-400">ℹ</span>
                      <span>{game.inputGuide}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                  />
                </div>
              )}
            </div>

            {/* Step 2: Package / Denomination Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-purple-300">
                  {t.step2SelectPackage}
                </label>
                {isGame && hasLivePackages && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {currentPackages.length} options
                  </span>
                )}
              </div>

              {loadingPackages ? (
                <div className="py-10 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                  <span className="text-xs">Loading live package tiers...</span>
                </div>
              ) : isGame && hasLivePackages ? (
                /* Real Dynamic Packages Grid with Authentic Currency Icons & Free Diamond Badges */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {currentPackages.map((pkg, idx) => {
                    const isSelected = selectedTierIndex === idx;
                    const pkgDisplayName =
                      lang === "km" && pkg.nameKh ? pkg.nameKh : pkg.name;

                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setSelectedTierIndex(idx)}
                        className={`group relative p-3 rounded-2xl border text-left transition-all overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? "bg-gradient-to-b from-purple-600/30 to-purple-900/40 border-purple-400 shadow-lg shadow-purple-500/25 ring-1 ring-purple-400 scale-[1.01]"
                            : "bg-white/[0.04] border-white/10 hover:border-white/20 hover:bg-white/[0.07]"
                        }`}
                      >
                        {/* Ambient Card Background Glow for Selected */}
                        {isSelected && (
                          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-400/20 rounded-bl-full pointer-events-none" />
                        )}

                        {/* Top: Currency Icon & Title */}
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <GameCurrencyIcon
                              iconType={currencyInfo.currencyIcon}
                              className="w-4 h-4 shrink-0"
                            />
                            <span className="text-xs font-black text-white line-clamp-1 leading-tight">
                              {pkgDisplayName}
                            </span>
                          </div>

                          {/* Free Diamond / Bonus Badge */}
                          {(pkg.bonusDiamonds && pkg.bonusDiamonds > 0) ||
                          pkg.badgeText ? (
                            <div className="mb-2">
                              <FreeDiamondBadge
                                bonusDiamonds={pkg.bonusDiamonds}
                                badgeText={pkg.badgeText}
                                badgeColor={pkg.badgeColor || "emerald"}
                                size="sm"
                              />
                            </div>
                          ) : pkg.isComposite ? (
                            <div className="mb-2">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                ⚡ Value Pack
                              </span>
                            </div>
                          ) : null}
                        </div>

                        {/* Bottom: Price */}
                        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/10">
                          <span className="text-xs font-black text-amber-400">
                            ${pkg.priceUsd}
                          </span>
                          {pkg.originalPrice && (
                            <span className="text-[10px] text-slate-500 line-through font-mono">
                              ${pkg.originalPrice}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : isGame ? (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-5 text-center">
                  <Package className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-300">
                    No packages available for this game.
                  </p>
                </div>
              ) : (
                /* Gift Card Tiers */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {giftCardTiers.map((tier, idx) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setSelectedTierIndex(idx)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedTierIndex === idx
                          ? "bg-purple-600/20 border-purple-400 shadow-lg shadow-purple-500/20 scale-[1.02]"
                          : "bg-white/5 border-white/5 hover:border-white/15"
                      }`}
                    >
                      <span className="text-xs font-bold text-white block">
                        {tier.amount}
                      </span>
                      <div className="flex items-baseline justify-between mt-1">
                        <span className="text-xs font-extrabold text-amber-400">
                          {tier.price}
                        </span>
                        <span className="text-[9px] text-purple-300 font-semibold">
                          {tier.bonus}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 3: Payment Gateway */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                {t.step3Payment}
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("khqr")}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                    paymentMethod === "khqr"
                      ? "bg-rose-500/20 border-rose-400 text-rose-300 shadow-md shadow-rose-500/10"
                      : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {t.paymentKhqr}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("aba")}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                    paymentMethod === "aba"
                      ? "bg-blue-500/20 border-blue-400 text-blue-300 shadow-md shadow-blue-500/10"
                      : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {t.paymentAba}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                    paymentMethod === "card"
                      ? "bg-purple-500/20 border-purple-400 text-purple-300 shadow-md shadow-purple-500/10"
                      : "bg-white/5 border-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {t.paymentCard}
                </button>
              </div>
            </div>

            {/* Total & Submit Button */}
            <div className="pt-3.5 border-t border-white/10 flex items-center justify-between gap-4 mt-auto">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">
                  {t.totalDue}
                </span>
                <span className="text-xl font-black text-white">
                  {currentPrice}
                </span>
              </div>
              <Button
                type="submit"
                disabled={!hasAvailableTier}
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white font-black text-sm shadow-xl shadow-purple-600/30 hover:opacity-95 active:scale-98 transition-all"
              >
                <Zap className="w-4 h-4 mr-1.5 fill-current" />
                {isGame ? t.checkoutActionGame : t.checkoutActionGiftCard}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
