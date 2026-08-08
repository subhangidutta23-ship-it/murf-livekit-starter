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
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-sky-300 uppercase shadow-md backdrop-blur-md">
          <ShieldAlert className="h-4 w-4 text-emerald-400" />
          DISASTER RESPONSE & RELIEF COORDINATION HOTLINE
        </div>

        {/* Hero Disaster Avatar */}
        <div className="mb-6">
          <DisasterAvatar state="ready" size="lg" />
        </div>

        {/* Hero Title & Purpose */}
        <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-snug max-w-xl">
          Sentinel AI Emergency & Relief Assistant
        </h1>
        <p className="mt-3 text-sm md:text-base text-slate-300 max-w-prose leading-relaxed">
          Report flood emergencies, request drought relief, coordinate supplies, or complete a fast welfare check-in via hands-free voice.
        </p>

        {/* Capability Pills */}
        <div className="my-6 grid grid-cols-2 sm:grid-cols-4 gap-2 w-full max-w-lg">
          <div className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-xs font-medium text-blue-300">
            <Waves size={14} className="text-blue-400" />
            <span>Flood Alerts</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-xs font-medium text-amber-300">
            <Sun size={14} className="text-amber-400" />
            <span>Drought Relief</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-xs font-medium text-emerald-300">
            <HeartHandshake size={14} className="text-emerald-400" />
            <span>Welfare Check</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 p-2 text-xs font-medium text-sky-300">
            <ShieldAlert size={14} className="text-sky-400" />
            <span>Emergency Info</span>
          </div>
        </div>

        {/* Ready State Indicator */}
        <AgentStateIndicator state="ready" className="mb-4" />

        {/* ONE Clear Primary Start Button (Step 1 & Step 2 Requirement) */}
        <Button
          size="lg"
          onClick={onStartCall}
          className="mt-2 w-full sm:w-80 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-mono text-sm font-extrabold tracking-wider uppercase shadow-xl shadow-emerald-950/50 py-7 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <PhoneCall className="mr-2.5 h-5 w-5 animate-bounce [animation-duration:2s]" />
          {startButtonText || 'START EMERGENCY CALL'}
        </Button>

        {/* Footer info */}
        <div className="mt-8 text-xs text-slate-400 flex items-center justify-center gap-1">
          <HelpCircle size={14} className="text-sky-400" />
          <span>Microphone access required for hands-free voice interaction.</span>
        </div>
      </div>
    );
  }
);

WelcomeView.displayName = 'WelcomeView';
