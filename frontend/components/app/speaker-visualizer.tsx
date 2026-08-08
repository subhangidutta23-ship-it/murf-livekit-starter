'use client';

import React from 'react';
import { DisasterAvatar } from '@/components/app/disaster-avatar';
import { AgentState } from '@/components/app/agent-state-indicator';
import { cn } from '@/lib/shadcn/utils';

interface SpeakerVisualizerProps {
  state: AgentState;
  className?: string;
}

export function SpeakerVisualizer({ state, className }: SpeakerVisualizerProps) {
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';

  return (
    <div className={cn('relative flex flex-col items-center justify-center py-6', className)}>
      {/* Sentinel Robot Avatar */}
      <DisasterAvatar state={state} size="lg" />

      {/* Speaker Identification Badge */}
      <div className="mt-6">
        {isListening && (
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-blue-400 bg-blue-950/80 border border-blue-800 px-3 py-1.5 rounded-full shadow-inner flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>LISTENING TO YOU • MIC ACTIVE</span>
          </span>
        )}
        {isSpeaking && (
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-3 py-1.5 rounded-full shadow-inner flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>SENTINEL IS SPEAKING • AUDIO OUT</span>
          </span>
        )}
        {state === 'connecting' && (
          <span className="text-xs font-mono font-semibold text-amber-400/80 bg-amber-950/40 border border-amber-800/60 px-3 py-1 rounded-full animate-pulse">
            Connecting to Sentinel AI...
          </span>
        )}
      </div>
    </div>
  );
}