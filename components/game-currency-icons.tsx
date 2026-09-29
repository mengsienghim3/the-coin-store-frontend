import React from "react";
import { Sparkles } from "lucide-react";

export type GameCurrencyType =
  | "mlbb_diamond"
  | "ff_diamond"
  | "pubg_uc"
  | "robux"
  | "genshin_crystal"
  | "telegram_star"
  | "wild_cores"
  | "default_diamond"
  | string;

interface GameCurrencyIconProps {
  iconType?: GameCurrencyType | null;
  className?: string;
  size?: number;
}

export function GameCurrencyIcon({
  iconType = "default_diamond",
  className = "w-5 h-5",
  size = 20,
}: GameCurrencyIconProps) {
  const type = (iconType || "default_diamond").toLowerCase();

  // Mobile Legends: Bang Bang Diamond (Cyan/Blue Faceted Brilliant)
  if (
    type === "mlbb_diamond" ||
    type.includes("mlbb") ||
    type.includes("mobile_legends")
  ) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)] ${className}`}
      >
        <defs>
          <linearGradient
            id="mlbb_top"
            x1="16"
            y1="2"
            x2="16"
            y2="12"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#E0F2FE" />
            <stop offset="1" stopColor="#38BDF8" />
          </linearGradient>
          <linearGradient
            id="mlbb_front"
            x1="16"
            y1="12"
            x2="16"
            y2="30"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#0EA5E9" />
            <stop offset="0.7" stopColor="#0284C7" />
            <stop offset="1" stopColor="#0369A1" />
          </linearGradient>
          <linearGradient
            id="mlbb_left"
            x1="3"
            y1="12"
            x2="16"
            y2="30"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#0369A1" />
          </linearGradient>
          <linearGradient
            id="mlbb_right"
            x1="29"
            y1="12"
            x2="16"
            y2="30"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#7DD3FC" />
            <stop offset="1" stopColor="#0284C7" />
          </linearGradient>
        </defs>
        {/* Top facet table */}
        <polygon
          points="10,3 22,3 29,11 3,11"
          fill="url(#mlbb_top)"
          stroke="#BAE6FD"
          strokeWidth="0.75"
        />
        <polygon
          points="12,3 20,3 17,9 15,9"
          fill="#FFFFFF"
          fillOpacity="0.8"
        />
        {/* Front center pavilion */}
        <polygon
          points="11,11 21,11 16,30"
          fill="url(#mlbb_front)"
          stroke="#38BDF8"
          strokeWidth="0.5"
        />
        {/* Left facet */}
        <polygon
          points="3,11 11,11 16,30"
          fill="url(#mlbb_left)"
          stroke="#0284C7"
          strokeWidth="0.5"
        />
        {/* Right facet */}
        <polygon
          points="21,11 29,11 16,30"
          fill="url(#mlbb_right)"
          stroke="#38BDF8"
          strokeWidth="0.5"
        />
        {/* Center brilliant shine */}
        <circle cx="16" cy="14" r="1.5" fill="#FFFFFF" />
        <line
          x1="16"
          y1="10"
          x2="16"
          y2="18"
          stroke="#FFFFFF"
          strokeWidth="0.75"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
        <line
          x1="12"
          y1="14"
          x2="20"
          y2="14"
          stroke="#FFFFFF"
          strokeWidth="0.75"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />
      </svg>
    );
  }

  // Free Fire Diamond (Energetic Turquoise / Aquamarine Diamond)
  if (
    type === "ff_diamond" ||
    type.includes("ff") ||
    type.includes("free_fire")
  ) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 drop-shadow-[0_0_8px_rgba(45,212,191,0.65)] ${className}`}
      >
        <defs>
          <linearGradient
            id="ff_outer"
            x1="16"
            y1="2"
            x2="16"
            y2="30"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#5EEAD4" />
            <stop offset="0.5" stopColor="#0D9488" />
            <stop offset="1" stopColor="#115E59" />
          </linearGradient>
          <linearGradient
            id="ff_top"
            x1="16"
            y1="2"
            x2="16"
            y2="11"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#CCFBF1" />
            <stop offset="1" stopColor="#2DD4BF" />
          </linearGradient>
        </defs>
        {/* Top facet */}
        <polygon
          points="9,2 23,2 30,10 2,10"
          fill="url(#ff_top)"
          stroke="#99F6E4"
          strokeWidth="0.75"
        />
        {/* Side facets */}
        <polygon
          points="2,10 10,10 16,30"
          fill="#14B8A6"
          stroke="#0F766E"
          strokeWidth="0.5"
        />
        <polygon
          points="10,10 22,10 16,30"
          fill="#2DD4BF"
          stroke="#5EEAD4"
          strokeWidth="0.5"
        />
        <polygon
          points="22,10 30,10 16,30"
          fill="#0D9488"
          stroke="#0F766E"
          strokeWidth="0.5"
        />
        {/* High energy glow stroke */}
        <polyline
          points="10,10 16,30 22,10"
          stroke="#FFFFFF"
          strokeWidth="0.75"
          strokeOpacity="0.7"
        />
        <polygon
          points="13,4 19,4 17,8 15,8"
          fill="#FFFFFF"
          fillOpacity="0.9"
        />
      </svg>
    );
  }

  // PUBG UC (Golden Metallic Unknown Cash Medal)
  if (type === "pubg_uc" || type.includes("pubg") || type.includes("uc")) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 drop-shadow-[0_0_8px_rgba(234,179,8,0.65)] ${className}`}
      >
        <defs>
          <radialGradient id="pubg_gold" cx="40%" cy="30%" r="70%">
            <stop stopColor="#FEF08A" />
            <stop offset="0.4" stopColor="#EAB308" />
            <stop offset="0.85" stopColor="#CA8A04" />
            <stop offset="1" stopColor="#854D0E" />
          </radialGradient>
          <linearGradient
            id="pubg_rim"
            x1="0"
            y1="0"
            x2="32"
            y2="32"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FEF08A" />
            <stop offset="0.5" stopColor="#A16207" />
            <stop offset="1" stopColor="#FEF08A" />
          </linearGradient>
        </defs>
        {/* Outer coin rim */}
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="url(#pubg_gold)"
          stroke="url(#pubg_rim)"
          strokeWidth="1.5"
        />
        <circle
          cx="16"
          cy="16"
          r="11"
          fill="none"
          stroke="#FEF9C3"
          strokeWidth="0.75"
          strokeDasharray="1.5 1.5"
        />
        {/* "UC" embossed text */}
        <text
          x="16"
          y="20"
          textAnchor="middle"
          fontSize="11"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#422006"
          stroke="#FEF08A"
          strokeWidth="0.5"
          letterSpacing="-0.5"
        >
          UC
        </text>
        {/* Glint shine */}
        <circle cx="8" cy="8" r="1" fill="#FFFFFF" />
      </svg>
    );
  }

  // Roblox Robux (Golden Tilted Hexagon)
  if (type === "robux" || type.includes("roblox")) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] ${className}`}
      >
        <defs>
          <linearGradient
            id="rbx_outer"
            x1="4"
            y1="4"
            x2="28"
            y2="28"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FCD34D" />
            <stop offset="0.6" stopColor="#D97706" />
            <stop offset="1" stopColor="#78350F" />
          </linearGradient>
        </defs>
        <polygon
          points="16,2 29,9 29,23 16,30 3,23 3,9"
          fill="url(#rbx_outer)"
          stroke="#FDE68A"
          strokeWidth="1.2"
        />
        <polygon
          points="16,9 23,13 23,19 16,23 9,19 9,13"
          fill="#181438"
          stroke="#FDE68A"
          strokeWidth="1"
        />
        <polygon
          points="16,11 20,13.5 20,18.5 16,21 12,18.5 12,13.5"
          fill="#F59E0B"
        />
      </svg>
    );
  }

  // Genshin Genesis Crystals / Primogem (4-Pointed Star Prism)
  if (
    type === "genshin_crystal" ||
    type.includes("genshin") ||
    type.includes("crystal")
  ) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 drop-shadow-[0_0_8px_rgba(168,85,247,0.7)] ${className}`}
      >
        <defs>
          <linearGradient
            id="genshin_star"
            x1="16"
            y1="2"
            x2="16"
            y2="30"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#E9D5FF" />
            <stop offset="0.4" stopColor="#C084FC" />
            <stop offset="0.8" stopColor="#7E22CE" />
            <stop offset="1" stopColor="#3B0764" />
          </linearGradient>
        </defs>
        {/* Star Polygon */}
        <polygon
          points="16,2 19,13 30,16 19,19 16,30 13,19 2,16 13,13"
          fill="url(#genshin_star)"
          stroke="#F3E8FF"
          strokeWidth="0.8"
        />
        <polygon
          points="16,7 18,14 25,16 18,18 16,25 14,18 7,16 14,14"
          fill="#FFFFFF"
          fillOpacity="0.4"
        />
        <circle cx="16" cy="16" r="2" fill="#FFFFFF" />
      </svg>
    );
  }

  // Telegram Star (Golden Shimmering Star)
  if (
    type === "telegram_star" ||
    type.includes("telegram") ||
    type.includes("star")
  ) {
    return (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`inline-block shrink-0 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)] ${className}`}
      >
        <defs>
          <linearGradient
            id="tg_star"
            x1="16"
            y1="2"
            x2="16"
            y2="30"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FEF08A" />
            <stop offset="0.5" stopColor="#F59E0B" />
            <stop offset="1" stopColor="#B45309" />
          </linearGradient>
        </defs>
        <polygon
          points="16,2 20.3,11.2 30.5,12.5 23,19.6 24.9,29.8 16,24.8 7.1,29.8 9,19.6 1.5,12.5 11.7,11.2"
          fill="url(#tg_star)"
          stroke="#FEF9C3"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        <polygon
          points="16,5 19,12 26,13 21,18 22,25 16,21 10,25 11,18 6,13 13,12"
          fill="#FFFFFF"
          fillOpacity="0.3"
        />
      </svg>
    );
  }

  // Default Universal Diamond (Cyan-Violet Prism)
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block shrink-0 drop-shadow-[0_0_8px_rgba(139,92,246,0.6)] ${className}`}
    >
      <defs>
        <linearGradient
          id="def_top"
          x1="16"
          y1="3"
          x2="16"
          y2="11"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#EDE9FE" />
          <stop offset="1" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient
          id="def_body"
          x1="16"
          y1="11"
          x2="16"
          y2="29"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#4C1D95" />
        </linearGradient>
      </defs>
      <polygon
        points="10,3 22,3 29,11 3,11"
        fill="url(#def_top)"
        stroke="#DDD6FE"
        strokeWidth="0.75"
      />
      <polygon
        points="11,11 21,11 16,29"
        fill="url(#def_body)"
        stroke="#8B5CF6"
        strokeWidth="0.5"
      />
      <polygon
        points="3,11 11,11 16,29"
        fill="#7C3AED"
        stroke="#6D28D9"
        strokeWidth="0.5"
      />
      <polygon
        points="21,11 29,11 16,29"
        fill="#A78BFA"
        stroke="#8B5CF6"
        strokeWidth="0.5"
      />
      <circle cx="16" cy="14" r="1.5" fill="#FFFFFF" />
    </svg>
  );
}

// ----------------------------------------------------------------------
// Free Diamonds / Bonus Badge Component
// ----------------------------------------------------------------------

interface FreeDiamondBadgeProps {
  bonusDiamonds?: number | null;
  badgeText?: string | null;
  badgeColor?: "emerald" | "pink" | "amber" | "purple" | "cyan" | string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function FreeDiamondBadge({
  bonusDiamonds,
  badgeText,
  badgeColor = "emerald",
  size = "md",
  className = "",
}: FreeDiamondBadgeProps) {
  // If neither text nor bonus diamonds are given, don't render
  const displayText =
    badgeText ||
    (bonusDiamonds && bonusDiamonds > 0 ? `+${bonusDiamonds} Free` : null);
  if (!displayText) return null;

  const color = (badgeColor || "emerald").toLowerCase();

  const colorStyles: Record<
    string,
    { bg: string; text: string; border: string; glow: string }
  > = {
    emerald: {
      bg: "bg-gradient-to-r from-emerald-500/20 via-teal-500/25 to-emerald-600/30",
      text: "text-emerald-300 font-black",
      border: "border-emerald-400/50",
      glow: "shadow-[0_0_12px_rgba(16,185,129,0.35)]",
    },
    pink: {
      bg: "bg-gradient-to-r from-pink-500/25 via-rose-500/25 to-purple-600/30",
      text: "text-pink-300 font-black",
      border: "border-pink-400/50",
      glow: "shadow-[0_0_12px_rgba(244,63,94,0.35)]",
    },
    amber: {
      bg: "bg-gradient-to-r from-amber-500/25 via-yellow-500/25 to-orange-600/30",
      text: "text-amber-300 font-black",
      border: "border-amber-400/50",
      glow: "shadow-[0_0_12px_rgba(245,158,11,0.35)]",
    },
    purple: {
      bg: "bg-gradient-to-r from-purple-500/25 via-indigo-500/25 to-pink-600/30",
      text: "text-purple-300 font-black",
      border: "border-purple-400/50",
      glow: "shadow-[0_0_12px_rgba(168,85,247,0.35)]",
    },
    cyan: {
      bg: "bg-gradient-to-r from-cyan-500/25 via-sky-500/25 to-blue-600/30",
      text: "text-cyan-300 font-black",
      border: "border-cyan-400/50",
      glow: "shadow-[0_0_12px_rgba(6,182,212,0.35)]",
    },
  };

  const style = colorStyles[color] || colorStyles.emerald;

  const sizeClasses = {
    sm: "text-[9px] px-1.5 py-0.5 gap-1",
    md: "text-[10px] px-2 py-0.5 gap-1.5",
    lg: "text-xs px-2.5 py-1 gap-2",
  }[size];

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md uppercase tracking-wider font-extrabold select-none transition-transform hover:scale-105 ${style.bg} ${style.text} ${style.border} ${style.glow} ${sizeClasses} ${className}`}
    >
      <Sparkles
        className={`${iconSizes} animate-pulse shrink-0 fill-current opacity-90`}
      />
      <span>{displayText}</span>
    </span>
  );
}

// Helper to deduce currency name & icon from game slug/name
export function getGameCurrency(
  slug?: string | null,
  name?: string | null,
): {
  currencyName: string;
  currencyIcon: GameCurrencyType;
} {
  const s = (slug || "").toLowerCase();
  const n = (name || "").toLowerCase();

  if (s.includes("mobile-legends") || n.includes("mobile legends")) {
    return { currencyName: "Diamonds", currencyIcon: "mlbb_diamond" };
  }
  if (s.includes("free-fire") || n.includes("free fire")) {
    return { currencyName: "Diamonds", currencyIcon: "ff_diamond" };
  }
  if (s.includes("pubg") || n.includes("pubg")) {
    return { currencyName: "UC", currencyIcon: "pubg_uc" };
  }
  if (s.includes("roblox") || n.includes("roblox")) {
    return { currencyName: "Robux", currencyIcon: "robux" };
  }
  if (s.includes("genshin") || n.includes("genshin")) {
    return {
      currencyName: "Genesis Crystals",
      currencyIcon: "genshin_crystal",
    };
  }
  if (s.includes("telegram") || n.includes("telegram")) {
    return { currencyName: "Stars", currencyIcon: "telegram_star" };
  }
  if (s.includes("magic-chess") || n.includes("magic chess")) {
    return { currencyName: "Diamonds", currencyIcon: "mlbb_diamond" };
  }

  return { currencyName: "Diamonds", currencyIcon: "default_diamond" };
}
