'use client';

import React, { useState } from 'react';
import { Game } from '../lib/api';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Zap, X, ShieldCheck, CreditCard, Sparkles, Check } from 'lucide-react';

interface QuickTopupModalProps {
  game: Game | null;
  onClose: () => void;
}

const DIAMOND_TIERS = [
  { id: 'tier_1', amount: '86 Diamonds', price: '$1.45', bonus: '+8 Bonus' },
  { id: 'tier_2', amount: '172 Diamonds', price: '$2.85', bonus: '+16 Bonus' },
  { id: 'tier_3', amount: '257 Diamonds', price: '$4.20', bonus: '+25 Bonus' },
  { id: 'tier_4', amount: 'Weekly Pass', price: '$1.99', bonus: 'Best Value' },
  { id: 'tier_5', amount: '706 Diamonds', price: '$11.50', bonus: '+70 Bonus' },
  { id: 'tier_6', amount: '2195 Diamonds', price: '$34.90', bonus: '+220 Bonus' },
];

export function QuickTopupModal({ game, onClose }: QuickTopupModalProps) {
  const [playerId, setPlayerId] = useState('');
  const [zoneId, setZoneId] = useState('');
  const [selectedTier, setSelectedTier] = useState(DIAMOND_TIERS[3].id);
  const [paymentMethod, setPaymentMethod] = useState<'khqr' | 'aba' | 'card'>('khqr');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!game) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  const currentTier = DIAMOND_TIERS.find((t) => t.id === selectedTier) || DIAMOND_TIERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#0f1422] to-[#080a10] border border-white/15 p-6 sm:p-8 shadow-2xl shadow-amber-500/10 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

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
            <h3 className="text-2xl font-black text-white">Order Dispatched!</h3>
            <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
              Your reload request has been sent through the high-frequency provider gateway.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header / Game Info */}
            <div className="flex items-center gap-4 pb-4 border-b border-white/10">
              <img
                src={game.imageUrl}
                alt={game.name}
                className="w-16 h-16 rounded-2xl object-cover border border-white/10 shadow-lg"
              />
              <div>
                <Badge variant="tourbillon" className="mb-1">
                  Instant Top-Up
                </Badge>
                <h3 className="text-xl font-extrabold text-white">{game.name}</h3>
                <span className="text-xs text-slate-400">{game.publisher}</span>
              </div>
            </div>

            {/* Step 1: Player Credentials */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                1. Enter Game Account Information
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    required
                    value={playerId}
                    onChange={(e) => setPlayerId(e.target.value)}
                    placeholder="User / Player ID"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60"
                  />
                </div>
                {game.hasZoneId ? (
                  <div>
                    <input
                      type="text"
                      required
                      value={zoneId}
                      onChange={(e) => setZoneId(e.target.value)}
                      placeholder="Zone / Server ID"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/60"
                    />
                  </div>
                ) : (
                  <div className="flex items-center text-[11px] text-slate-400 bg-white/[0.02] border border-white/5 rounded-xl px-3">
                    Zone ID not required
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                {game.inputGuide || 'Locate your ID in your in-game profile avatar.'}
              </p>
            </div>

            {/* Step 2: Diamond Denomination Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                2. Select Diamond Package
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {DIAMOND_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedTier(tier.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedTier === tier.id
                        ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-white/5 border-white/5 hover:border-white/15'
                    }`}
                  >
                    <span className="text-xs font-bold text-white block">{tier.amount}</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xs font-extrabold text-amber-400">{tier.price}</span>
                      <span className="text-[9px] text-emerald-400 font-semibold">{tier.bonus}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
                3. Payment Gateway
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('khqr')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                    paymentMethod === 'khqr'
                      ? 'bg-rose-500/15 border-rose-400 text-rose-300'
                      : 'bg-white/5 border-white/5 text-slate-400'
                  }`}
                >
                  Bakong KHQR
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('aba')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                    paymentMethod === 'aba'
                      ? 'bg-blue-500/15 border-blue-400 text-blue-300'
                      : 'bg-white/5 border-white/5 text-slate-400'
                  }`}
                >
                  ABA Pay
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                      : 'bg-white/5 border-white/5 text-slate-400'
                  }`}
                >
                  Card / Visa
                </button>
              </div>
            </div>

            {/* Footer Summary & Ignite Button */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-slate-400 block">Total Due</span>
                <span className="text-xl font-black text-white">{currentTier.price}</span>
              </div>
              <Button type="submit" variant="tourbillon" size="lg" className="flex-1">
                <Zap className="w-4 h-4 mr-1.5 fill-current" />
                Ignite Instant Top-Up
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
