"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Zap, Headphones } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer
      id="support"
      className="mt-10 sm:mt-20 border-t border-white/10 bg-[#080617] pt-8 sm:pt-12 pb-10 sm:pb-14 text-slate-300"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        {/* Top Row: Brand Info */}
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg shadow-purple-500/20 border border-white/10 bg-[#0e0c26] shrink-0">
            <img
              src="/logo.webp"
              alt="The Coin Store Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-black text-white text-sm sm:text-base tracking-wide">
              The Coin Store — Digital Marketplace
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 max-w-xl mt-0.5 leading-relaxed">
              {t("brandDescription")}
            </p>
          </div>
        </div>

        {/* Simple "We Accept : " Strip (matches user reference design) */}
        <div className="py-4 sm:py-5 border-y border-white/10 flex items-center gap-3">
          <span className="text-sm sm:text-base font-normal text-slate-400 select-none">
            {t("weAccept")}
          </span>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <img
              src="/aba_bank.svg"
              alt="ABA"
              className="h-7 sm:h-8 w-auto object-contain rounded-md shadow-sm"
            />
            <img
              src="/khqr.svg"
              alt="KHQR"
              className="h-7 sm:h-8 w-auto object-contain rounded-md shadow-sm"
            />
          </div>
        </div>

        {/* Middle Row: Trust Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 py-2 border-b border-white/5 text-xs text-slate-400">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-white block text-[11px] sm:text-xs leading-tight">
                {t("officialSafeTitle")}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 block leading-tight">
                {t("officialSafeSubtitle")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
            </div>
            <div>
              <span className="font-bold text-white block text-[11px] sm:text-xs leading-tight">
                {t("instantDeliveryTitle")}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 block leading-tight">
                {t("instantDeliverySubtitle")}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center shrink-0">
              <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-400" />
            </div>
            <div>
              <span className="font-bold text-white block text-[11px] sm:text-xs leading-tight">
                {t("vipSupportTitle")}
              </span>
              <span className="text-[9px] sm:text-[10px] text-slate-500 block leading-tight">
                {t("vipSupportSubtitle")}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Row: Links & Copyright */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-[11px] sm:text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} The Coin Store. {t("copyright")}
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-slate-400 text-[11px] sm:text-xs">
            <Link href="/" className="hover:text-purple-400 transition-colors">
              {t("games")}
            </Link>
            <Link href="/" className="hover:text-purple-400 transition-colors">
              {t("giftCards")}
            </Link>
            <Link href="/" className="hover:text-purple-400 transition-colors">
              {t("termsOfService")}
            </Link>
            <Link href="/" className="hover:text-purple-400 transition-colors">
              {t("refundPolicy")}
            </Link>
            <a
              href="#support"
              className="hover:text-purple-400 transition-colors text-pink-400 font-semibold"
            >
              {t("vipSupportTitle")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
