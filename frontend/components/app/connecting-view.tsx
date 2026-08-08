'use client';

import React from 'react';
import { motion } from 'motion/react';
import { DisasterAvatar } from '@/components/app/disaster-avatar';
import { AgentStateIndicator } from '@/components/app/agent-state-indicator';
import { ShieldAlert, Loader2, Radio } from 'lucide-react';

interface ConnectingViewProps {
  ref?: React.Ref<HTMLDivElement>;
}

export const ConnectingView = React.forwardRef<HTMLDivElement, ConnectingViewProps>((props, ref) => {
  return (
    <div ref={ref} className="fixed inset-0 z-40 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/30 text-white">
      
      {/* Background Pulse Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* Emergency Header Tag */}
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-4 py-1.5 text-xs font-mono font-bold tracking-widest text-amber-300 uppercase shadow-md">
        <Radio className="h-4 w-4 animate-pulse text-amber-400" />
        DISASTER RESPONSE NETWORK • CONNECTING
      </div>

      {/* Main Avatar Graphic */}
      <div className="relative mb-6">
        <DisasterAvatar state="connecting" size="lg" />
      </div>

      {/* State Text & Indicators */}
      <AgentStateIndicator state="connecting" />

      {/* Wait Prompt */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3 rounded-full border border-slate-800 bg-slate-900/90 px-6 py-2.5 shadow-xl text-sm font-medium text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
          <span>Joining emergency channel... Please wait on the line.</span>
        </div>

        <p className="text-xs text-slate-400 max-w-sm text-center">
          Preparing AI Relief Coordinator for flood alerts, drought response, and welfare check-ins.
        </p>
      </div>
    </div>
  );
});

ConnectingView.displayName = 'ConnectingView';
