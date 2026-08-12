'use client';

import React from 'react';
import { AlertTriangle, Radio } from 'lucide-react';

const ALERT_MESSAGES = [
  '⚠️ STAGE 2 FLASH FLOOD WATCH: Sector 4 Patna • Ganga River level 4.2ft above danger stage',
  '🚨 RED ALERT: Western Ghats Coastal Districts • Heavy Rainfall & Storm Surge Warning (IMD)',
  '☀️ EXTREME DROUGHT ADVISORY: Marathwada & Bundelkhand • Emergency Water Rations Deployed',
  '🏥 EMERGENCY RELIEF ACTIVE: 1,500+ Shelter Beds Available • Call 112 / 1078 for Support',
  '🌊 YAMUNA RIVER FLOOD WATCH: Delhi Kashmere Gate Low-Lying Enclaves Evacuation Warning',
  '🇮🇳 NATIONAL DISASTER RELIEF COMMAND: 24/7 Voice AI Emergency Relay Active Across All Districts',
];

export function DisasterTicker() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-9 bg-slate-950/95 border-b border-amber-500/40 text-slate-100 flex items-center overflow-hidden backdrop-blur-md shadow-lg select-none">
      
      {/* Fixed Pulsing Red/Amber Live Alert Badge */}
      <div className="shrink-0 h-full px-3.5 bg-gradient-to-r from-red-600 via-amber-600 to-amber-700 text-white font-mono text-[11px] font-extrabold tracking-wider uppercase flex items-center gap-2 z-10 shadow-md border-r border-amber-400/30">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
        <AlertTriangle className="h-3.5 w-3.5 text-amber-200 animate-pulse" />
        <span className="whitespace-nowrap">LIVE ALERTS</span>
      </div>

      {/* Scrolling News Ticker Stream */}
      <div className="relative flex-1 overflow-hidden h-full flex items-center">
        <div className="flex whitespace-nowrap animate-marquee items-center gap-12 font-mono text-[11px] md:text-xs text-amber-200/90 font-medium">
          {ALERT_MESSAGES.concat(ALERT_MESSAGES).map((msg, idx) => (
            <div key={idx} className="flex items-center gap-3 shrink-0">
              <span>{msg}</span>
              <span className="text-amber-500/60 font-bold">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Secondary Right Channel Tag */}
      <div className="hidden sm:flex shrink-0 h-full px-3 bg-slate-900/90 border-l border-slate-800 text-[10px] font-mono text-slate-400 items-center gap-1.5 z-10">
        <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
        <span>IMD / NDRF RELAY</span>
      </div>
    </div>
  );
}

export default DisasterTicker;
