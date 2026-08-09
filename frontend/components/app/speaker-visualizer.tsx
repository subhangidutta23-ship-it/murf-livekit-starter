'use client';

import React from 'react';
import { motion } from 'motion/react';
import { DisasterAvatar } from '@/components/app/disaster-avatar';
import { AgentState } from '@/components/app/agent-state-indicator';
import { cn } from '@/lib/shadcn/utils';

interface SpeakerVisualizerProps {
  state?: AgentState;
  className?: string;
}

export function SpeakerVisualizer({ state = 'ready', className }: SpeakerVisualizerProps) {
  const isListening = state === 'listening';
  const isSpeaking = state === 'speaking';

  return (
    <div className={cn('relative flex flex-col items-center justify-center py-6', className)}>
      {/* 1. Sentinel Robot Avatar */}
      <DisasterAvatar state={state} size="lg" />

      {/* 2. Dynamic Audio Waveforms */}
      <div className="mt-6 flex items-center justify-center gap-1.5 h-10">
        {Array.from({ length: 11 }).map((_, index) => {
          const delay = (index % 3) * 0.12;
          const duration = 0.4 + (index % 4) * 0.1;

          return (
            <motion.div
              key={index}
              className={cn(
                'w-1.5 rounded-full transition-colors duration-300',
                isSpeaking && 'bg-emerald-500 shadow-emerald-200 shadow-sm',
                isListening && 'bg-blue-500 shadow-blue-200 shadow-sm',
                state === 'connecting' && 'bg-amber-400',
                state === 'ready' && 'bg-sky-400',
                state === 'ended' && 'bg-slate-300'
              )}
              animate={
                isSpeaking || isListening
                  ? {
                    height: [
                      '10px',
                      `${Math.min(38, 14 + (index % 5) * 6 + Math.sin(index) * 8)}px`,
                      '8px',
                    ],
                  }
                  : state === 'connecting'
                    ? { height: ['8px', '18px', '8px'] }
                    : { height: '6px' }
              }
              transition={{
                duration: isSpeaking || isListening ? duration : 1.2,
                repeat: Infinity,
                repeatType: 'reverse',
                delay,
                ease: 'easeInOut',
              }}
            />
          );
        })}
      </div>

      {/* 3. Speaker State Tag */}
      <div className="mt-3">
        {isListening && (
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-blue-700 bg-blue-100 border border-blue-200 px-3 py-1 rounded-full shadow-sm">
            ● Listening To You • Voice Active
          </span>
        )}
        {isSpeaking && (
          <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full shadow-sm">
            ● Sentinel AI Speaking
          </span>
        )}
      </div>
    </div>
  );
}