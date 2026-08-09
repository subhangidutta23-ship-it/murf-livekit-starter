'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { DisasterAvatar } from '@/components/app/disaster-avatar';
import { AgentStateIndicator } from '@/components/app/agent-state-indicator';
import { ShieldAlert, PhoneCall, Waves, Sun, HeartHandshake, HelpCircle } from 'lucide-react';

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
  ref?: React.Ref<HTMLDivElement>;
}

export const WelcomeView = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'> & WelcomeViewProps>(
  ({ startButtonText, onStartCall }, ref) => {
    return (
      <div ref={ref} className="relative w-full max-w-2xl mx-auto px-4 py-8 flex flex-col items-center text-center">

        {/* Disaster Response Emergency Top Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-300 bg-white/90 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-sky-800 uppercase shadow-md backdrop-blur-md">
          <ShieldAlert className="h-4 w-4 text-emerald-600" />
          DISASTER RESPONSE & RELIEF COORDINATION HOTLINE
        </div>

        {/* Hero Disaster Avatar */}
        <div className="mb-6">
          <DisasterAvatar state="ready" size="lg" />
        </div>

        {/* Hero Title & Purpose */}
        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug max-w-xl">
          Sentinel AI Emergency & Relief Assistant
        </h1>
        <p className="mt-3 text-sm md:text-base text-slate-700 max-w-prose leading-relaxed font-medium">
          Report flood emergencies, request drought relief, coordinate supplies, or complete a fast welfare check-in via hands-free voice.
        </p>

        {/* Capability Pills */}
        <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-lg">
          <div className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 p-2.5 text-xs font-semibold text-blue-700 shadow-sm hover:shadow-md transition">
            <Waves size={16} className="text-blue-600" />
            <span>Flood Alerts</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 p-2.5 text-xs font-semibold text-amber-700 shadow-sm hover:shadow-md transition">
            <Sun size={16} className="text-amber-600" />
            <span>Drought Relief</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 p-2.5 text-xs font-semibold text-emerald-700 shadow-sm hover:shadow-md transition">
            <HeartHandshake size={16} className="text-emerald-600" />
            <span>Welfare Check</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white/90 p-2.5 text-xs font-semibold text-sky-700 shadow-sm hover:shadow-md transition">
            <ShieldAlert size={16} className="text-sky-600" />
            <span>Emergency Info</span>
          </div>
        </div>

        {/* Ready State Indicator */}
        <AgentStateIndicator state="ready" className="mb-4" />

        {/* ONE Clear Primary Start Button */}
        <Button
          size="lg"
          onClick={onStartCall}
          className="mt-2 w-full sm:w-80 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-mono text-sm font-extrabold tracking-wider uppercase shadow-xl shadow-emerald-600/20 py-7 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <PhoneCall className="mr-2.5 h-5 w-5 animate-bounce [animation-duration:2s]" />
          {startButtonText || 'START EMERGENCY CALL'}
        </Button>

        {/* Footer info */}
        <div className="mt-8 text-xs font-medium text-slate-600 flex items-center justify-center gap-1">
          <HelpCircle size={14} className="text-sky-600" />
          <span>Microphone access required for hands-free voice interaction.</span>
        </div>
      </div>
    );
  }
);

WelcomeView.displayName = 'WelcomeView';
