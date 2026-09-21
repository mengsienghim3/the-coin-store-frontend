'use client';

import React, { useState } from 'react';
import { Gauge, Zap, Activity, Flame, ShieldAlert } from 'lucide-react';
import { Badge } from './ui/badge';

export function TourbillonGauge() {
  const [activeTelemetry, setActiveTelemetry] = useState<'rpm' | 'hp' | 'speed'>('rpm');

  return (
    <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0e121d] via-[#090b12] to-[#06070a] border border-white/10 shadow-2xl shadow-black/80 overflow-hidden group">
      {/* Ambient background glows */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/20 transition-all duration-700" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700" />

      {/* Top Header info */}
      <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <Badge variant="tourbillon" className="gap-1.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            V16 Top-Up Engine
          </Badge>
          <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
            Horology Precision
          </span>
        </div>
        <Badge variant="hypercar" className="font-mono text-[10px]">
          1,800 HP Direct
        </Badge>
      </div>

      {/* Gauge Visualization & Skeleton Tourbillon Dial */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
        {/* Left: The Mechanical Watch Tourbillon Dial */}
        <div className="relative flex items-center justify-center py-4">
          {/* Outer Titanium Bezel with tachometer ticks */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-2 border-slate-700/80 bg-slate-950/80 shadow-2xl flex items-center justify-center backdrop-blur-xl">
            {/* Ambient inner rim glow */}
            <div className="absolute inset-1.5 rounded-full border border-amber-500/30 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none" />

            {/* Dial Ticks SVG */}
            <svg
              className="absolute inset-0 w-full h-full p-2 pointer-events-none"
              viewBox="0 0 200 200"
            >
              {/* Outer circle track */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="2"
                strokeDasharray="4 6"
              />
              <circle
                cx="100"
                cy="100"
                r="78"
                fill="none"
                stroke="rgba(245,158,11,0.25)"
                strokeWidth="1.5"
              />
              {/* Tachometer numbers */}
              <text x="100" y="26" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold" fontFamily="monospace">9000 RPM</text>
              <text x="175" y="103" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">6K</text>
              <text x="100" y="180" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">0</text>
              <text x="25" y="103" textAnchor="middle" fill="#94a3b8" fontSize="7" fontFamily="monospace">3K</text>
            </svg>

            {/* Rotating Skeleton Gear 1 (Outer Cage) */}
            <div className="absolute w-44 h-44 rounded-full border border-amber-500/30 animate-tourbillon-spin flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500/30 fill-current">
                {/* 12-toothed horological gear */}
                <path d="M47 5h6v12h-6zM47 83h6v12h-6zM5 47h12v6H5zM83 47h12v6H83zM18 18l4.2-4.2 8.5 8.5-4.2 4.2zM77.3 77.3l4.2-4.2 8.5 8.5-4.2 4.2zM18 82l8.5-8.5 4.2 4.2-8.5 8.5zM77.3 22.7l8.5-8.5 4.2 4.2-8.5 8.5z" />
                <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            {/* Reverse Rotating Gear 2 (Inner Escapement) */}
            <div className="absolute w-28 h-28 rounded-full border border-cyan-400/40 animate-gear-reverse flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full text-cyan-400/30 fill-current">
                <path d="M48 10h4v10h-4zM48 80h4v10h-4zM10 48h10v4H10zM80 48h10v4H80zM22 22l2.8-2.8 7 7-2.8 2.8zM75.2 75.2l2.8-2.8 7 7-2.8 2.8z" />
                <circle cx="50" cy="50" r="22" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>

            {/* Sweeping Needle (Mechanical Tachometer Hand) */}
            <div className="absolute w-full h-full flex items-center justify-center animate-escapement-tick pointer-events-none">
              <div className="w-1.5 h-24 bg-gradient-to-t from-transparent via-amber-400 to-yellow-200 rounded-full shadow-lg shadow-amber-400/60 -translate-y-10 origin-bottom transform rotate-45" />
            </div>

            {/* Center Horology Hub: Ruby Bearing & Titanium Cap */}
            <div className="relative z-10 w-12 h-12 rounded-full bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 border-2 border-amber-400/80 flex items-center justify-center shadow-lg shadow-amber-500/30">
              {/* Ruby Pivot Jewel */}
              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-rose-600 via-rose-500 to-rose-400 border border-white/60 shadow-inner animate-pulse" />
            </div>
          </div>
        </div>

        {/* Right: Real-time Hypercar Performance Telemetry */}
        <div className="flex flex-col justify-between space-y-4">
          <div>
            <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5" />
              Live Reseller Telemetry
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Swiss Precision. <br />
              <span className="text-tachometer">Hypercar Speed.</span>
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Engineered with the cadence of a 9,000 RPM naturally aspirated V16 and automated provider APIs. Your diamonds are injected in sub-seconds.
            </p>
          </div>

          {/* 3 Telemetry Cards */}
          <div className="grid grid-cols-3 gap-2.5 pt-2">
            <button
              onClick={() => setActiveTelemetry('rpm')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                activeTelemetry === 'rpm'
                  ? 'bg-amber-500/10 border-amber-400/50 shadow-lg shadow-amber-500/10'
                  : 'bg-white/5 border-white/5 hover:border-white/10'
              }`}
            >
              <span className="text-[10px] font-mono text-slate-400 block">CADENCE</span>
              <span className="text-lg font-black text-white block mt-0.5">9,000</span>
              <span className="text-[10px] font-bold text-amber-400 uppercase">RPM Engine</span>
            </button>

            <button
              onClick={() => setActiveTelemetry('hp')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                activeTelemetry === 'hp'
                  ? 'bg-cyan-500/10 border-cyan-400/50 shadow-lg shadow-cyan-500/10'
                  : 'bg-white/5 border-white/5 hover:border-white/10'
              }`}
            >
              <span className="text-[10px] font-mono text-slate-400 block">OUTPUT</span>
              <span className="text-lg font-black text-white block mt-0.5">1,800</span>
              <span className="text-[10px] font-bold text-cyan-400 uppercase">HP Power</span>
            </button>

            <button
              onClick={() => setActiveTelemetry('speed')}
              className={`p-3 rounded-2xl border text-left transition-all ${
                activeTelemetry === 'speed'
                  ? 'bg-rose-500/10 border-rose-400/50 shadow-lg shadow-rose-500/10'
                  : 'bg-white/5 border-white/5 hover:border-white/10'
              }`}
            >
              <span className="text-[10px] font-mono text-slate-400 block">LATENCY</span>
              <span className="text-lg font-black text-white block mt-0.5">0.2s</span>
              <span className="text-[10px] font-bold text-rose-400 uppercase">Instant Auto</span>
            </button>
          </div>

          {/* Active Telemetry Detail Bar */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 font-medium">
                {activeTelemetry === 'rpm' && 'High-frequency provider queue dispatch'}
                {activeTelemetry === 'hp' && 'Direct provider API pipeline connected'}
                {activeTelemetry === 'speed' && 'Zero human bottleneck — automated bot injection'}
              </span>
            </div>
            <span className="font-mono text-[11px] font-bold text-emerald-400">OPTIMAL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
