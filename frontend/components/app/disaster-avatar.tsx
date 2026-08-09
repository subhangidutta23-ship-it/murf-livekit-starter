'use client';

import React from 'react';
import { cn } from '@/lib/shadcn/utils';
import { AgentState } from '@/components/app/agent-state-indicator';

interface DisasterAvatarProps {
  state?: AgentState;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function DisasterAvatar({
  state = 'ready',
  size = 'lg',
  className,
}: DisasterAvatarProps) {
  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';
  const isConnecting = state === 'connecting';

  const sizeClasses = {
    sm: 'w-14 h-14',
    md: 'w-24 h-24',
    lg: 'w-32 h-32 md:w-40 md:h-40',
  };

  const svgSizes = {
    sm: 36,
    md: 64,
    lg: 96,
  };

  // Robot Visor Glow & Accent Colors
  const statusColors = {
    ready: {
      visor: '#38bdf8', // Sky blue
      core: '#0284c7',
      glow: 'shadow-sky-300/60',
      border: 'border-sky-400',
      bgGrad: 'from-white via-sky-50 to-cyan-100/80',
      badgeBg: 'bg-white text-sky-900 border-sky-300',
    },
    connecting: {
      visor: '#f59e0b', // Amber
      core: '#d97706',
      glow: 'shadow-amber-300/60',
      border: 'border-amber-400',
      bgGrad: 'from-white via-amber-50 to-orange-100/80',
      badgeBg: 'bg-white text-amber-900 border-amber-300',
    },
    listening: {
      visor: '#3b82f6', // Blue
      core: '#2563eb',
      glow: 'shadow-blue-300/60',
      border: 'border-blue-400',
      bgGrad: 'from-white via-blue-50 to-indigo-100/80',
      badgeBg: 'bg-white text-blue-900 border-blue-300',
    },
    speaking: {
      visor: '#10b981', // Emerald
      core: '#059669',
      glow: 'shadow-emerald-300/60',
      border: 'border-emerald-400',
      bgGrad: 'from-white via-emerald-50 to-teal-100/80',
      badgeBg: 'bg-white text-emerald-900 border-emerald-300',
    },
    ended: {
      visor: '#64748b', // Slate
      core: '#475569',
      glow: 'shadow-slate-200/40',
      border: 'border-slate-300',
      bgGrad: 'from-white via-slate-50 to-slate-200/80',
      badgeBg: 'bg-white text-slate-800 border-slate-300',
    },
    error: {
      visor: '#ef4444', // Red
      core: '#dc2626',
      glow: 'shadow-red-300/60',
      border: 'border-red-400',
      bgGrad: 'from-white via-red-50 to-rose-100/80',
      badgeBg: 'bg-white text-red-900 border-red-300',
    },
  };

  const current = statusColors[state] || statusColors.ready;

  return (
    <div className={cn('relative flex items-center justify-center', className)}>

      {/* Dynamic Sound Wave & Radar Pulsing Rings */}
      {(isSpeaking || isListening || isConnecting) && (
        <>
          <div
            className={cn(
              'absolute inset-0 rounded-full animate-ping opacity-25',
              isSpeaking && 'bg-emerald-500 [animation-duration:1.2s]',
              isListening && 'bg-blue-500 [animation-duration:1.5s]',
              isConnecting && 'bg-amber-500 [animation-duration:1s]'
            )}
          />
          <div
            className={cn(
              'absolute -inset-4 rounded-full border border-dashed opacity-40 animate-spin',
              isSpeaking && 'border-emerald-400 [animation-duration:8s]',
              isListening && 'border-blue-400 [animation-duration:6s]',
              isConnecting && 'border-amber-400 [animation-duration:3s]'
            )}
          />
        </>
      )}

      {/* Ambient Radial Glow */}
      <div
        className={cn(
          'absolute inset-0 rounded-full blur-2xl opacity-60 transition-all duration-500',
          isSpeaking && 'bg-emerald-500 scale-125 opacity-80',
          isListening && 'bg-blue-500 scale-110 opacity-70',
          isConnecting && 'bg-amber-500 scale-110 opacity-60',
          state === 'ready' && 'bg-sky-500/40 scale-100',
          state === 'ended' && 'bg-slate-700/20 scale-90'
        )}
      />

      {/* Sentinel Robot Capsule */}
      <div
        className={cn(
          'relative z-10 flex flex-col items-center justify-center rounded-3xl border-2 transition-all duration-300 shadow-xl p-2 backdrop-blur-md',
          sizeClasses[size],
          current.border,
          current.glow,
          `bg-gradient-to-b ${current.bgGrad}`,
          isSpeaking && 'scale-105 shadow-emerald-500/40',
          isConnecting && 'animate-pulse'
        )}
      >
        {/* Robot Vector Artwork (Sentinel Emergency Response Android) */}
        <svg
          width={svgSizes[size]}
          height={svgSizes[size]}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="filter drop-shadow-md"
        >
          {/* Antenna */}
          <line x1="50" y1="12" x2="50" y2="24" stroke="#0284c7" strokeWidth="4" strokeLinecap="round" />
          <circle
            cx="50"
            cy="10"
            r="4"
            fill={current.visor}
            className={cn(isSpeaking || isListening ? 'animate-ping' : '')}
          />

          {/* Ears / Head Mount Sensors */}
          <rect x="18" y="38" width="8" height="18" rx="4" fill="#0284c7" />
          <rect x="74" y="38" width="8" height="18" rx="4" fill="#0284c7" />
          <circle cx="22" cy="47" r="2" fill={current.visor} />
          <circle cx="78" cy="47" r="2" fill={current.visor} />

          {/* Main Robot Head */}
          <rect
            x="24"
            y="24"
            width="52"
            height="44"
            rx="14"
            fill="url(#headGradient)"
            stroke="#0284c7"
            strokeWidth="2.5"
          />

          {/* Robot Visor Display */}
          <rect
            x="30"
            y="34"
            width="40"
            height="22"
            rx="8"
            fill="#0369a1"
            stroke={current.visor}
            strokeWidth="1.5"
          />

          {/* Animated Visor Eyes / Scanning Line */}
          {isSpeaking && (
            <>
              {/* Dual Glowing Eyes + Equalizer Wave in Visor */}
              <circle cx="42" cy="45" r="4" fill="#10b981" className="animate-pulse" />
              <circle cx="58" cy="45" r="4" fill="#10b981" className="animate-pulse" />
              <path d="M 36 49 Q 50 55 64 49" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" />
            </>
          )}

          {isListening && (
            <>
              {/* Blue Scanner Grid / Listening Eyes */}
              <circle cx="40" cy="45" r="4" fill="#60a5fa" />
              <circle cx="60" cy="45" r="4" fill="#60a5fa" />
              <line x1="34" y1="45" x2="66" y2="45" stroke="#93c5fd" strokeWidth="1" strokeDasharray="2 2" />
            </>
          )}

          {isConnecting && (
            <>
              {/* Amber Scanning Radar */}
              <circle cx="50" cy="45" r="5" fill="#f59e0b" className="animate-ping" />
              <line x1="32" y1="45" x2="68" y2="45" stroke="#fbbf24" strokeWidth="2" />
            </>
          )}

          {state === 'ready' && (
            <>
              {/* Friendly Sky-Blue Eyes */}
              <circle cx="40" cy="44" r="4" fill="#38bdf8" />
              <circle cx="60" cy="44" r="4" fill="#38bdf8" />
              <path d="M 44 49 Q 50 53 56 49" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none" />
            </>
          )}

          {state === 'ended' && (
            <>
              {/* Sleeping Eyes */}
              <path d="M 36 45 Q 40 48 44 45" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M 56 45 Q 60 48 64 45" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="none" />
            </>
          )}

          {state === 'error' && (
            <>
              {/* Red Warning Eyes */}
              <path d="M 36 41 L 44 47 M 44 41 L 36 47" stroke="#ef4444" strokeWidth="2" />
              <path d="M 56 41 L 64 47 M 64 41 L 56 47" stroke="#ef4444" strokeWidth="2" />
            </>
          )}

          {/* Neck Joint */}
          <rect x="42" y="68" width="16" height="8" rx="2" fill="#0284c7" />

          {/* Robot Torso Base */}
          <path
            d="M 28 76 L 72 76 L 68 94 L 32 94 Z"
            fill="url(#torsoGradient)"
            stroke="#0284c7"
            strokeWidth="2"
          />

          {/* Chest Reactor Core / Sentinel Emblem */}
          <circle cx="50" cy="85" r="5" fill={current.core} stroke={current.visor} strokeWidth="1.5" />
          <path d="M 50 81 L 50 89 M 46 85 L 54 85" stroke="#ffffff" strokeWidth="1" />

          {/* Gradients */}
          <defs>
            <linearGradient id="headGradient" x1="24" y1="24" x2="76" y2="68" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#e0f2fe" />
            </linearGradient>
            <linearGradient id="torsoGradient" x1="28" y1="76" x2="72" y2="94" gradientUnits="userSpaceOnUse">
              <stop stopColor="#f0f9ff" />
              <stop offset="1" stopColor="#bae6fd" />
            </linearGradient>
          </defs>
        </svg>

        {/* Voice AI Name Tag Badge */}
        <div className={cn('absolute -bottom-2 border px-2.5 py-0.5 rounded-full shadow-md text-[10px] font-mono font-bold tracking-widest uppercase flex items-center gap-1.5 backdrop-blur-md', current.badgeBg)}>
          <span className={cn('w-1.5 h-1.5 rounded-full inline-block', isSpeaking ? 'bg-emerald-500 animate-ping' : isListening ? 'bg-blue-500' : isConnecting ? 'bg-amber-500' : 'bg-sky-500')} />
          SENTINEL
        </div>
      </div>
    </div>
  );
}
