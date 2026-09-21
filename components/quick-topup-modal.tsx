"use client";

import React, { useState } from "react";
import { Game, GiftCard } from "../lib/api";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Zap,
  X,
  ShieldCheck,
  Mail,
  Check,
  CreditCard,
  Sparkles,
} from "lucide-react";

interface QuickTopupModalProps {
  item: (Game | GiftCard) | null;
  itemType: "game" | "giftcard";
  onClose: () => void;
}

const DEFAULT_DIAMOND_TIERS = [
  { id: "tier_1", amount: "86 Diamonds", price: "$1.45", bonus: "+8 Bonus" },
  { id: "tier_2", amount: "172 Diamonds", price: "$2.85", bonus: "+16 Bonus" },
  { id: "tier_3", amount: "257 Diamonds", price: "$4.20", bonus: "+25 Bonus" },
  { id: "tier_4", amount: "Weekly Pass", price: "$1.99", bonus: "Best Value" },
  { id: "tier_5", amount: "706 Diamonds", price: "$11.50", bonus: "+70 Bonus" },
  {
    id: "tier_6",
    amount: "2195 Diamonds",
    price: "$34.90",
    bonus: "+220 Bonus",
  },
];

export function QuickTopupModal({
  item,
  itemType,
  onClose,
}: QuickTopupModalProps) {
  const [playerId, setPlayerId] = useState("");
  const [zoneId, setZoneId] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"khqr" | "aba" | "card">(
    "khqr",
  );
  const [isSuccess, setIsSuccess] = useState(false);

  if (!item) return null;

  const isGame = itemType === "game";
  const game = isGame ? (item as Game) : null;
  const giftCard = !isGame ? (item as GiftCard) : null;

  const tiers = isGame
    ? DEFAULT_DIAMOND_TIERS
    : (giftCard?.denominations || []).map((d, i) => ({
        id: `gift_tier_${i}`,
        amount: d.label,
        price: d.price,
        bonus: "Digital Code",
      }));

  const selectedTier = tiers[selectedTierIndex] || tiers[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#181438] via-[#120f2c] to-[#0a081a] border border-purple-500/20 p-6 sm:p-8 shadow-2xl shadow-purple-500/10 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-1.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {isSuccess ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-white">
              Order Dispatched!
            </h3>
            <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
              {isGame
                ? "Your game reload request has been sent to the automated provider gateway."
                : `Your digital redemption code will be sent to ${recipientEmail || "your email"} in 60 seconds.`}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header / Item Info */}
            <div className="flex items-center gap-4 pb-4 border-b border-white/10">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-lg"
              />
              <div>
                <Badge variant="tourbillon" className="mb-1">
                  {isGame ? "Instant Top-Up" : "Instant Digital Voucher"}
                </Badge>
                <h3 className="text-xl font-extrabold text-white">
                  {item.name}
                </h3>
                <span className="text-xs text-purple-300 font-medium">
                  {isGame ? game?.publisher : giftCard?.brand} •{" "}
                  {isGame ? game?.category : giftCard?.region}
                </span>
              </div>
            </div>

            {/* Step 1: Input target info */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                {isGame
                  ? "1. Enter Game Account Information"
                  : "1. Enter Delivery Email / Telegram"}
              </label>

              {isGame ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      required
                      value={playerId}
                      onChange={(e) => setPlayerId(e.target.value)}
                      placeholder="User / Player ID"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                    />
                  </div>
                  {game?.hasZoneId ? (
                    <div>
                      <input
                        type="text"
                        required
                        value={zoneId}
                        onChange={(e) => setZoneId(e.target.value)}
                        placeholder="Zone / Server ID"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center text-[11px] text-slate-400 bg-white/[0.02] border border-white/5 rounded-xl px-3">
                      Zone ID not required
                    </div>
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
                    placeholder="Enter email to receive code (e.g. name@domain.com)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                  />
                </div>
              )}
            </div>

            {/* Step 2: Denomination Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                {isGame
                  ? "2. Select Diamond Package"
                  : "2. Select Gift Card Value"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {tiers.map((tier, idx) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTierIndex(idx)}
                    className={`p-3 rounded-xl border text-left transition-all ${
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
            </div>

            {/* Step 3: Payment Gateway */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-300 mb-2">
                3. Select Payment Rail
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("khqr")}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                    paymentMethod === "khqr"
                      ? "bg-rose-500/20 border-rose-400 text-rose-300"
                      : "bg-white/5 border-white/5 text-slate-400"
                  }`}
                >
                  Bakong KHQR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("aba")}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                    paymentMethod === "aba"
                      ? "bg-blue-500/20 border-blue-400 text-blue-300"
                      : "bg-white/5 border-white/5 text-slate-400"
                  }`}
                >
                  ABA Pay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                    paymentMethod === "card"
                      ? "bg-purple-500/20 border-purple-400 text-purple-300"
                      : "bg-white/5 border-white/5 text-slate-400"
                  }`}
                >
                  Visa / Master
                </button>
              </div>
            </div>

            {/* Total & Submit Button */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-slate-400 block">
                  Total Due
                </span>
                <span className="text-xl font-black text-white">
                  {selectedTier.price}
                </span>
              </div>
              <Button
                type="submit"
                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 text-white font-black text-sm shadow-xl shadow-purple-600/30 hover:opacity-95"
              >
                <Zap className="w-4 h-4 mr-1.5 fill-current" />
                {isGame ? "Instant Top-Up" : "Purchase Code"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
