'use client';

import React from 'react';
import { motion } from 'motion/react';
import { DisasterAvatar } from '@/components/app/disaster-avatar';
import { AgentStateIndicator } from '@/components/app/agent-state-indicator';
import { Button } from '@/components/ui/button';
import { PhoneCall, ShieldCheck, HeartHandshake, Info } from 'lucide-react';

interface CallEndedViewProps {
  onRestartCall: () => void;
  ref?: React.Ref<HTMLDivElement>;
}

export const CallEndedView = React.forwardRef<HTMLDivElement, CallEndedViewProps>(
  ({ onRestartCall }, ref) => {
    return (
      <div
        ref={ref}
        className="fixed inset-0 z-40 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-sky-950/30 text-white overflow-y-auto"
      >
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center">
          
          {/* Header Tag */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-sky-300 uppercase shadow-md">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            DISASTER RESPONSE • SESSION COMPLETED
          </div>

          {/* Avatar Graphic */}
          <div className="mb-4">
            <DisasterAvatar state="ended" size="lg" />
          </div>

          {/* State Indicator */}
          <AgentStateIndicator state="ended" />

          {/* Emergency Summary Notice Box */}
          <div className="my-6 w-full rounded-2xl border border-slate-800 bg-slate-900/80 p-5 text-left shadow-xl backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <HeartHandshake size={18} />
              <span>Welfare & Relief Confirmation</span>
            </div>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Your disaster report, flood/drought update, or welfare check-in has been logged with the Disaster Response Center. Stay tuned to local official broadcasts for immediate emergency instructions.
            </p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1"><Info size={14} className="text-sky-400" /> Emergency Hotline: 911 / 112</span>
              <span>24/7 Relief Active</span>
            </div>
          </div>

          {/* Start Again Option Button (Step 5 Requirement) */}
          <Button
            size="lg"
            onClick={onRestartCall}
            className="w-full sm:w-80 rounded-full bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-mono text-sm font-bold tracking-wider uppercase shadow-xl shadow-emerald-950/50 py-6"
          >
            <PhoneCall className="mr-2 h-5 w-5 animate-pulse" />
            Start New Emergency Call
          </Button>
        </div>
      </div>
    );
  }
);

CallEndedView.displayName = 'CallEndedView';
