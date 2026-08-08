'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio, Mic, Volume2, PhoneOff, CheckCircle2, AlertTriangle, Bot } from 'lucide-react';
import { cn } from '@/lib/shadcn/utils';

export type AgentState = 'ready' | 'connecting' | 'listening' | 'speaking' | 'ended' | 'error';

interface AgentStateIndicatorProps {
  state: AgentState;
  errorMessage?: string;
  className?: string;
}

export function AgentStateIndicator({ state, errorMessage, className }: AgentStateIndicatorProps) {
  const stateConfig = {
    ready: {
      label: 'Ready',
      sublabel: 'Disaster Response Agent online. Click below to begin report or check-in.',
      badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      dotColor: 'bg-sky-400',
      icon: CheckCircle2,
      speakerText: 'Agent Ready',
    },
    connecting: {
      label: 'Connecting...',
      sublabel: 'Establishing emergency channel with Agent... Please wait.',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse',
      dotColor: 'bg-amber-400',
      icon: Radio,
      speakerText: 'Connecting to Agent...',
    },
    listening: {
      label: 'Listening to you',
      sublabel: 'Disaster Response Agent is listening to your voice report.',
      badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      dotColor: 'bg-blue-400 animate-ping',
      icon: Mic,
      speakerText: '🎙️ Listening to you',
    },
    speaking: {
      label: 'Agent is speaking',
      sublabel: 'Disaster Response Agent is replying to your emergency inquiry.',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      dotColor: 'bg-emerald-400 animate-ping',
      icon: Volume2,
      speakerText: '🔊 Agent is speaking',
    },
    ended: {
      label: 'Call Ended',
      sublabel: 'The conversation is complete. Stay safe.',
      badgeBg: 'bg-slate-700/40 text-slate-300 border-slate-600',
      dotColor: 'bg-slate-500',
      icon: PhoneOff,
      speakerText: 'Call Ended',
    },
    error: {
      label: 'Microphone / Session Error',
      sublabel: errorMessage || 'Microphone access denied or connection error.',
      badgeBg: 'bg-red-500/20 text-red-300 border-red-500/40',
      dotColor: 'bg-red-500',
      icon: AlertTriangle,
      speakerText: 'Attention Needed',
    },
  };

  const current = stateConfig[state] || stateConfig.ready;
  const Icon = current.icon;

  return (
    <div className={cn('w-full max-w-xl mx-auto flex flex-col items-center gap-2 text-center z-20', className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={state}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center gap-2"
        >
          {/* Main Status Pill */}
          <div
            className={cn(
              'inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs md:text-sm font-semibold tracking-wide backdrop-blur-md shadow-lg',
              current.badgeBg
            )}
          >
            <span className={cn('w-2.5 h-2.5 rounded-full inline-block', current.dotColor)} />
            <Icon size={16} className="inline-block" />
            <span className="font-mono uppercase">{current.speakerText}</span>
          </div>

          {/* Subtitle description */}
          <p className="text-xs md:text-sm text-slate-300 font-medium max-w-md">
            {current.sublabel}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
