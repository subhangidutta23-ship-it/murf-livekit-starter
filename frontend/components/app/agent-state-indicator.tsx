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
      sublabel: 'Sentinel Robot online. Click below to begin disaster report.',
      badgeBg: 'bg-sky-100 text-sky-950 border-sky-400 dark:bg-sky-950/80 dark:text-sky-200 dark:border-sky-600 font-bold shadow-sm',
      dotColor: 'bg-emerald-500',
      icon: Bot,
      speakerText: 'Sentinel Robot Ready',
    },
    connecting: {
      label: 'Connecting...',
      sublabel: 'Establishing emergency channel with Sentinel Robot... Please wait.',
      badgeBg: 'bg-amber-100 text-amber-950 border-amber-400 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-600 animate-pulse font-bold shadow-sm',
      dotColor: 'bg-amber-500',
      icon: Radio,
      speakerText: 'Connecting to Sentinel Robot...',
    },
    listening: {
      label: 'Listening to you',
      sublabel: 'Sentinel Robot is listening to your voice report.',
      badgeBg: 'bg-blue-100 text-blue-950 border-blue-400 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-600 font-bold shadow-sm',
      dotColor: 'bg-blue-600 animate-ping',
      icon: Mic,
      speakerText: '🎙️ Listening to you',
    },
    speaking: {
      label: 'Sentinel Robot is speaking',
      sublabel: 'Sentinel Robot is replying to your emergency inquiry.',
      badgeBg: 'bg-emerald-100 text-emerald-950 border-emerald-400 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-600 font-bold shadow-sm',
      dotColor: 'bg-emerald-600 animate-ping',
      icon: Volume2,
      speakerText: '🔊 Sentinel Robot is speaking',
    },
    ended: {
      label: 'Call Ended',
      sublabel: 'The conversation is complete. Stay safe.',
      badgeBg: 'bg-slate-200 text-slate-900 border-slate-400 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 font-bold shadow-sm',
      dotColor: 'bg-slate-600',
      icon: PhoneOff,
      speakerText: 'Call Ended',
    },
    error: {
      label: 'Microphone / Session Error',
      sublabel: errorMessage || 'Microphone access denied or connection error.',
      badgeBg: 'bg-red-100 text-red-950 border-red-400 dark:bg-red-950/80 dark:text-red-200 dark:border-red-600 font-bold shadow-sm',
      dotColor: 'bg-red-600',
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
          <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 font-semibold max-w-md">
            {current.sublabel}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
