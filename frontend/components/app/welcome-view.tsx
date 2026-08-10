'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { DisasterAvatar } from '@/components/app/disaster-avatar';
import { AgentStateIndicator } from '@/components/app/agent-state-indicator';
import { ShieldAlert, PhoneCall, Waves, Sun, HeartHandshake, HelpCircle, Globe } from 'lucide-react';

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
  ref?: React.Ref<HTMLDivElement>;
}

export const WelcomeView = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'> & WelcomeViewProps>(
  ({ startButtonText, onStartCall }, ref) => {
    return (
      <div ref={ref} className="relative z-10 w-full max-w-2xl mx-auto px-4 pt-12 md:pt-16 pb-8 flex flex-col items-center text-center">

        {/* Voice for Bharat Emergency Top Badge */}
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/80 bg-white/95 dark:bg-slate-900/95 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-slate-800 dark:text-slate-200 uppercase shadow-lg backdrop-blur-md">
          <span className="text-base">🇮🇳</span>
          <span className="bg-gradient-to-r from-amber-600 via-blue-900 to-emerald-700 dark:from-amber-400 dark:via-sky-400 dark:to-emerald-400 bg-clip-text text-transparent">
            VOICE FOR BHARAT
          </span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-sans">राष्ट्रीय आपदा कमांड</span>
        </div>

        {/* Hero Disaster Avatar */}
        <div className="mb-5">
          <DisasterAvatar state="ready" size="lg" />
        </div>

        {/* Hero Title & Purpose */}
        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight leading-snug max-w-xl">
          Sentinel AI Emergency & Relief Assistant
        </h1>
        <p className="mt-1.5 text-xs md:text-sm font-semibold text-amber-700 dark:text-amber-400 tracking-wide font-sans">
          वॉइस फॉर भारत • आपदा राहत एवं आपातकालीन सहायता प्रणाली
        </p>
        <p className="mt-2.5 text-xs md:text-base text-slate-700 dark:text-slate-300 max-w-prose leading-relaxed font-medium">
          Report flood emergencies, request drought relief, locate shelters, or check family safety hands-free. You can talk directly with the agent.
        </p>

        {/* Indian Helpline Emergency Bar */}
        <div className="my-2 w-full max-w-lg rounded-xl border border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-emerald-500/10 dark:from-amber-900/20 dark:via-blue-900/20 dark:to-emerald-900/20 px-3 py-2 text-[11px] md:text-xs font-mono font-bold text-slate-800 dark:text-slate-200 flex items-center justify-around shadow-sm">
          <span>🚨 Helpline: <strong>112</strong></span>
          <span className="text-slate-300">|</span>
          <span>🌊 NDRF: <strong>1078</strong></span>
          <span className="text-slate-300">|</span>
          <span>🚑 Medical: <strong>108</strong></span>
        </div>

        {/* Capability Cards Grid with Center-Aligned Hindi & English Text */}
        <div className="my-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full max-w-xl">
          {/* Card 1: Flood Alerts */}
          <div className="flex flex-col items-center justify-center text-center rounded-xl border border-blue-200/80 dark:border-blue-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-sm hover:shadow-md transition-all duration-200">
            <Waves size={18} className="text-blue-600 dark:text-blue-400 mb-1 shrink-0" />
            <span className="text-xs font-bold text-blue-900 dark:text-blue-200 leading-tight text-center">
              Flood Alerts
            </span>
            <span className="text-[11px] font-sans font-medium text-slate-600 dark:text-slate-400 mt-1 text-center w-full block">
              बाढ़ चेतावनी
            </span>
          </div>

          {/* Card 2: Drought Relief */}
          <div className="flex flex-col items-center justify-center text-center rounded-xl border border-amber-200/80 dark:border-amber-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-sm hover:shadow-md transition-all duration-200">
            <Sun size={18} className="text-amber-600 dark:text-amber-400 mb-1 shrink-0" />
            <span className="text-xs font-bold text-amber-900 dark:text-amber-200 leading-tight text-center">
              Drought Relief
            </span>
            <span className="text-[11px] font-sans font-medium text-slate-600 dark:text-slate-400 mt-1 text-center w-full block">
              सूखा राहत
            </span>
          </div>

          {/* Card 3: Relief Shelters */}
          <div className="flex flex-col items-center justify-center text-center rounded-xl border border-emerald-200/80 dark:border-emerald-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-sm hover:shadow-md transition-all duration-200">
            <ShieldAlert size={18} className="text-emerald-600 dark:text-emerald-400 mb-1 shrink-0" />
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 leading-tight text-center">
              Relief Shelters
            </span>
            <span className="text-[11px] font-sans font-medium text-slate-600 dark:text-slate-400 mt-1 text-center w-full block">
              राहत शिविर एवं बेड
            </span>
          </div>

          {/* Card 4: Welfare Check */}
          <div className="flex flex-col items-center justify-center text-center rounded-xl border border-sky-200/80 dark:border-sky-800 bg-white/95 dark:bg-slate-900/95 p-3 shadow-sm hover:shadow-md transition-all duration-200">
            <HeartHandshake size={18} className="text-sky-600 dark:text-sky-400 mb-1 shrink-0" />
            <span className="text-xs font-bold text-sky-900 dark:text-sky-200 leading-tight text-center">
              Welfare Check
            </span>
            <span className="text-[11px] font-sans font-medium text-slate-600 dark:text-slate-400 mt-1 text-center w-full block">
              सुरक्षा चेक-इन
            </span>
          </div>
        </div>

        {/* Ready State Indicator */}
        <AgentStateIndicator state="ready" className="mb-3" />

        {/* ONE Clear Primary Start Button */}
        <Button
          size="lg"
          onClick={onStartCall}
          className="mt-2 w-full max-w-xl rounded-full bg-gradient-to-r from-amber-600 via-emerald-600 to-sky-700 hover:from-amber-500 hover:to-sky-600 text-white font-mono text-xs md:text-sm font-extrabold tracking-wider uppercase shadow-2xl shadow-emerald-600/30 px-6 sm:px-8 py-7 transition-all duration-300 hover:scale-[1.03] active:scale-95 border border-white/30"
        >
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <PhoneCall className="h-5 w-5 shrink-0 animate-bounce [animation-duration:2s]" />
            <span>START EMERGENCY CALL</span>
            <span className="opacity-60 font-normal">•</span>
            <span className="font-sans text-xs md:text-sm font-bold normal-case tracking-normal">आपातकालीन कॉल</span>
          </div>
        </Button>

        {/* Footer info */}
        <div className="mt-6 text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center justify-center gap-1">
          <HelpCircle size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Hands-free voice active. Click above to start talking with the agent.</span>
        </div>
      </div>
    );
  }
);

WelcomeView.displayName = 'WelcomeView';
