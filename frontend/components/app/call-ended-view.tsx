'use client';

import React from 'react';
import { motion } from 'motion/react';
import { DisasterAvatar } from '@/components/app/disaster-avatar';
import { AgentStateIndicator } from '@/components/app/agent-state-indicator';
import { Button } from '@/components/ui/button';
import { PhoneCall, ShieldCheck, HeartHandshake, Info, Home } from 'lucide-react';

interface CallEndedViewProps {
  onRestartCall: () => void;
  onGoHome?: () => void;
  ref?: React.Ref<HTMLDivElement>;
}

export const CallEndedView = React.forwardRef<HTMLDivElement, CallEndedViewProps>(
  ({ onRestartCall, onGoHome }, ref) => {
    return (
      <div
        ref={ref}
        className="fixed inset-0 z-40 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-100 via-sky-50/80 to-slate-200 text-slate-900 overflow-y-auto"
      >
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px] opacity-15 pointer-events-none" />

        <div className="relative z-10 w-full max-w-lg flex flex-col items-center text-center">
          
          {/* Header Tag */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400 bg-white/95 dark:bg-slate-900/95 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-slate-800 dark:text-slate-200 uppercase shadow-lg backdrop-blur-md">
            <span>🇮🇳</span>
            <span className="text-emerald-700 dark:text-emerald-400">VOICE FOR BHARAT</span>
            <span className="text-slate-300">•</span>
            <span>SESSION LOGGED</span>
          </div>

          {/* Avatar Graphic */}
          <div className="mb-4">
            <DisasterAvatar state="ended" size="lg" />
          </div>

          {/* State Indicator */}
          <AgentStateIndicator state="ended" />

          {/* Emergency Summary Notice Box */}
          <div className="my-6 w-full rounded-2xl border border-amber-200/80 bg-white/95 dark:bg-slate-900/95 p-5 text-left shadow-xl backdrop-blur-md space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
              <HeartHandshake size={18} />
              <span>Welfare & Relief Confirmation (जन कल्याण रिपोर्ट)</span>
            </div>
            <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Your disaster report, flood/drought update, or welfare check-in has been logged with the National Disaster Response Center. Stay tuned to official Indian radio broadcasts & SMS alerts.
            </p>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1"><Info size={14} className="text-amber-600" /> Helpline: 112 / 1078 / 108</span>
              <span>24/7 NDRF Relay Active</span>
            </div>
          </div>

          {/* Action Options: Start New Call & Go Back to Main Page */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
            <Button
              size="lg"
              onClick={onRestartCall}
              className="w-full sm:flex-1 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-mono text-xs md:text-sm font-bold tracking-wider uppercase shadow-xl shadow-emerald-600/20 py-6 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <PhoneCall className="mr-2 h-4 w-4 md:h-5 md:w-5 animate-pulse" />
              Start New Call
            </Button>

            {onGoHome && (
              <Button
                size="lg"
                variant="outline"
                onClick={onGoHome}
                className="w-full sm:flex-1 rounded-full border-2 border-slate-300 bg-white/90 hover:bg-slate-100 text-slate-800 font-mono text-xs md:text-sm font-bold tracking-wider uppercase shadow-md py-6 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <Home className="mr-2 h-4 w-4 md:h-5 md:w-5 text-sky-600" />
                Main Page
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

CallEndedView.displayName = 'CallEndedView';
