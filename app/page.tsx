"use client";

import React, { useState, useEffect } from "react";
import {
  Coins,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
  Search,
  Filter,
  ArrowRight,
  Check,
} from "lucide-react";
import { fetchCoins, Coin } from "../lib/api";

export default function HomePage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<{ coin: Coin; quantity: number }[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetchCoins().then((data) => {
      setCoins(data);
      setLoading(false);
    });
  }, []);

  const filteredCoins = coins.filter((coin) => {
    const matchesCategory =
      selectedCategory === "all" ||
      coin.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      coin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (coin: Coin) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.coin.id === coin.id);
      if (existing) {
        return prev.map((item) =>
          item.coin.id === coin.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { coin, quantity: 1 }];
    });
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalCartAmount = cart.reduce(
    (sum, item) => sum + item.coin.price * item.quantity,
    0,
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#090a0f] text-slate-100">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600/20 via-yellow-500/20 to-amber-600/20 border-b border-amber-500/20 py-2 px-4 text-center text-xs font-medium text-amber-300">
        ✨ Free insured express shipping on certified bullion orders over $1,000
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#090a0f]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Coins className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block leading-none">
                The Coin Store
              </span>
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold">
                Rare & Bullion
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search gold, silver, mint marks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50"
            />
          </div>

          {/* Cart Button */}
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium">Cart</span>
            {totalCartCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Section */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-950 border border-amber-500/20 p-8 sm:p-12 mb-12">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Authenticity & Mint Struck
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
              Secure Your Wealth with Timeless Coinage.
            </h1>
            <p className="text-slate-300 text-base sm:text-lg mb-8 leading-relaxed">
              Explore investment-grade precious metals, rare numismatic
              artifacts, and official sovereign bullion directly sourced and
              verified.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#catalog"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-semibold text-sm hover:opacity-95 transition-opacity shadow-lg shadow-amber-500/25 flex items-center gap-2"
              >
                Browse Catalog
                <ArrowRight className="w-4 h-4" />
              </a>
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                100% Genuine Guaranteed
              </div>
            </div>
          </div>
        </section>

        {/* Filters */}
        <div
          id="catalog"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto">
            {["all", "gold", "silver", "collectible"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400">
            Showing{" "}
            <span className="font-semibold text-white">
              {filteredCoins.length}
            </span>{" "}
            verified items
          </div>
        </div>

        {/* Coin Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-80 rounded-2xl bg-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCoins.map((coin) => (
              <div
                key={coin.id}
                className="group rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-amber-500/40 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 mb-4 border border-white/5">
                    {coin.imageUrl ? (
                      <img
                        src={coin.imageUrl}
                        alt={coin.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-800">
                        <Coins className="w-12 h-12 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-400 uppercase tracking-widest border border-white/10">
                      {coin.category}
                    </div>
                  </div>

                  <div className="text-xs font-mono text-amber-400/80 mb-1">
                    {coin.symbol}
                  </div>
                  <h3 className="font-bold text-white text-base mb-1 group-hover:text-amber-300 transition-colors">
                    {coin.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {coin.description ||
                      "Authentic authenticated coinage item."}
                  </p>
                </div>

                <div>
                  <div className="flex items-baseline justify-between mb-4 pt-3 border-t border-white/5">
                    <div>
                      <span className="text-xs text-slate-400 block">
                        Unit Price
                      </span>
                      <span className="text-lg font-extrabold text-white">
                        $
                        {coin.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {coin.stock} in stock
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(coin)}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 group-hover:bg-amber-500 group-hover:text-slate-950"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Shopping Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#10121a] h-full border-l border-white/10 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">Your Cart</h2>
                  <span className="text-xs text-slate-400">
                    ({totalCartCount} items)
                  </span>
                </div>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  Close
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  Your cart is currently empty.
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div
                      key={item.coin.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {item.coin.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {item.quantity} × ${item.coin.price.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-amber-400">
                        ${(item.coin.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-slate-400">Total</span>
                <span className="text-xl font-extrabold text-white">
                  ${totalCartAmount.toFixed(2)}
                </span>
              </div>
              <button
                disabled={cart.length === 0}
                onClick={() => alert("Order checkout initiated!")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 border-t border-white/10 bg-black/40 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          <p>© 2026 The Coin Store. Authenticated Bullion & Numismatics.</p>
        </div>
      </footer>
    </div>
  );
}
