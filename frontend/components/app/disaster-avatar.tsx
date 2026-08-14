'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/shadcn/utils';
import { AgentState } from '@/components/app/agent-state-indicator';

export type AgentRole = 'main' | 'shelter_specialist';

interface DisasterAvatarProps {
  state?: AgentState;
  size?: 'sm' | 'md' | 'lg';
  agentRole?: AgentRole;
  onRoleChange?: (role: AgentRole) => void;
  allowToggle?: boolean;
  className?: string;
}

export function DisasterAvatar({
  state = 'ready',
  size = 'lg',
  agentRole: externalRole,
  onRoleChange,
  allowToggle = true,
  className,
}: DisasterAvatarProps) {
  const [internalRole, setInternalRole] = useState<AgentRole>('main');
  
  // Use externalRole if provided, otherwise fall back to internalRole
  const currentRole = externalRole || internalRole;

  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';
  const isConnecting = state === 'connecting';

  const toggleRole = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextRole: AgentRole = currentRole === 'main' ? 'shelter_specialist' : 'main';
    setInternalRole(nextRole);
    if (onRoleChange) {
      onRoleChange(nextRole);
    }
  };

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

  const isShelter = currentRole === 'shelter_specialist';

  // Status Colors & Themes for both roles
  const statusColors = isShelter
    ? {
        ready: {
          visor: '#f97316', // Emergency Orange
          core: '#10b981', // Relief Green
          glow: 'shadow-orange-400/60',
          border: 'border-orange-500',
          bgGrad: 'from-orange-50 via-amber-50 to-emerald-100/80',
          badgeBg: 'bg-gradient-to-r from-orange-500 to-emerald-600 text-white border-orange-400 shadow-md',
          badgeText: 'SHELTER SPECIALIST',
        },
        connecting: {
          visor: '#f59e0b',
          core: '#d97706',
          glow: 'shadow-amber-400/60',
          border: 'border-amber-500',
          bgGrad: 'from-amber-50 via-orange-50 to-emerald-100/80',
          badgeBg: 'bg-gradient-to-r from-amber-500 to-emerald-600 text-white border-amber-400 shadow-md',
          badgeText: 'CONNECTING SPECIALIST',
        },
        listening: {
          visor: '#3b82f6',
          core: '#10b981',
          glow: 'shadow-emerald-400/60',
          border: 'border-emerald-500',
          bgGrad: 'from-emerald-50 via-teal-50 to-orange-100/80',
          badgeBg: 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-400 shadow-md',
          badgeText: 'SHELTER SPECIALIST',
        },
        speaking: {
          visor: '#10b981',
          core: '#f97316',
          glow: 'shadow-emerald-500/70',
          border: 'border-emerald-500',
          bgGrad: 'from-emerald-50 via-orange-50 to-amber-100/80',
          badgeBg: 'bg-gradient-to-r from-orange-600 to-emerald-600 text-white border-emerald-400 shadow-lg',
          badgeText: 'SHELTER SPECIALIST',
        },
        ended: {
          visor: '#64748b',
          core: '#475569',
          glow: 'shadow-slate-200/40',
          border: 'border-slate-300',
          bgGrad: 'from-white via-slate-50 to-slate-200/80',
          badgeBg: 'bg-slate-700 text-white border-slate-500',
          badgeText: 'SHELTER SPECIALIST',
        },
        error: {
          visor: '#ef4444',
          core: '#dc2626',
          glow: 'shadow-red-300/60',
          border: 'border-red-400',
          bgGrad: 'from-white via-red-50 to-rose-100/80',
          badgeBg: 'bg-red-600 text-white border-red-400',
          badgeText: 'SHELTER ERROR',
        },
      }
    : {
        ready: {
          visor: '#38bdf8', // Sky blue
          core: '#0284c7', // Command Blue
          glow: 'shadow-sky-300/60',
          border: 'border-sky-400',
          bgGrad: 'from-white via-sky-50 to-cyan-100/80',
          badgeBg: 'bg-white text-sky-900 border-sky-300 shadow-sm',
          badgeText: 'SENTINEL COMMAND',
        },
        connecting: {
          visor: '#f59e0b',
          core: '#d97706',
          glow: 'shadow-amber-300/60',
          border: 'border-amber-400',
          bgGrad: 'from-white via-amber-50 to-orange-100/80',
          badgeBg: 'bg-white text-amber-900 border-amber-300 shadow-sm',
          badgeText: 'CONNECTING SENTINEL',
        },
        listening: {
          visor: '#3b82f6',
          core: '#2563eb',
          glow: 'shadow-blue-300/60',
          border: 'border-blue-400',
          bgGrad: 'from-white via-blue-50 to-indigo-100/80',
          badgeBg: 'bg-white text-blue-900 border-blue-300 shadow-sm',
          badgeText: 'SENTINEL COMMAND',
        },
        speaking: {
          visor: '#10b981',
          core: '#059669',
          glow: 'shadow-emerald-300/60',
          border: 'border-emerald-400',
          bgGrad: 'from-white via-emerald-50 to-teal-100/80',
          badgeBg: 'bg-white text-emerald-900 border-emerald-300 shadow-sm',
          badgeText: 'SENTINEL COMMAND',
        },
        ended: {
          visor: '#64748b',
          core: '#475569',
          glow: 'shadow-slate-200/40',
          border: 'border-slate-300',
          bgGrad: 'from-white via-slate-50 to-slate-200/80',
          badgeBg: 'bg-white text-slate-800 border-slate-300',
          badgeText: 'SENTINEL COMMAND',
        },
        error: {
          visor: '#ef4444',
          core: '#dc2626',
          glow: 'shadow-red-300/60',
          border: 'border-red-400',
          bgGrad: 'from-white via-red-50 to-rose-100/80',
          badgeBg: 'bg-white text-red-900 border-red-300',
          badgeText: 'SENTINEL ERROR',
        },
      };

  const current = statusColors[state] || statusColors.ready;

  return (
    <div className={cn('relative flex items-center justify-center group', className)}>
      {/* Role Switcher Pill Overlay */}
      {allowToggle && (
        <button
          type="button"
          onClick={toggleRole}
          title="Click to swap between Main Agent (Robot) and Shelter Specialist (Tent)"
          className="absolute -top-3 z-30 px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border bg-slate-900/90 text-slate-100 border-slate-700 shadow-lg backdrop-blur-md hover:bg-slate-800 transition-all flex items-center gap-1 cursor-pointer hover:scale-105"
        >
          <span>{isShelter ? '⛺ Shelter Specialist' : '🤖 Main Command'}</span>
          <span className="text-amber-400 font-extrabold">⇄</span>
        </button>
      )}

      {/* Dynamic Sound Wave & Radar Pulsing Rings */}
      {(isSpeaking || isListening || isConnecting) && (
        <>
          <div
            className={cn(
              'absolute inset-0 rounded-full animate-ping opacity-25',
              isSpeaking && (isShelter ? 'bg-orange-500' : 'bg-emerald-500') + ' [animation-duration:1.2s]',
              isListening && (isShelter ? 'bg-emerald-500' : 'bg-blue-500') + ' [animation-duration:1.5s]',
              isConnecting && 'bg-amber-500 [animation-duration:1s]'
            )}
          />
          <div
            className={cn(
              'absolute -inset-4 rounded-full border border-dashed opacity-40 animate-spin',
              isSpeaking && (isShelter ? 'border-orange-400' : 'border-emerald-400') + ' [animation-duration:8s]',
              isListening && (isShelter ? 'border-emerald-400' : 'border-blue-400') + ' [animation-duration:6s]',
              isConnecting && 'border-amber-400 [animation-duration:3s]'
            )}
          />
        </>
      )}

      {/* Ambient Radial Glow */}
      <div
        className={cn(
          'absolute inset-0 rounded-full blur-2xl opacity-60 transition-all duration-500',
          isSpeaking && (isShelter ? 'bg-orange-500 scale-125 opacity-80' : 'bg-emerald-500 scale-125 opacity-80'),
          isListening && (isShelter ? 'bg-emerald-500 scale-110 opacity-70' : 'bg-blue-500 scale-110 opacity-70'),
          isConnecting && 'bg-amber-500 scale-110 opacity-60',
          state === 'ready' && (isShelter ? 'bg-orange-500/40 scale-100' : 'bg-sky-500/40 scale-100'),
          state === 'ended' && 'bg-slate-700/20 scale-90'
        )}
      />

      {/* Avatar Capsule Container */}
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
        {/* CHARACTER 1: MAIN AGENT - Blue / Silver Robot Icon */}
        {!isShelter && (
          <svg
            width={svgSizes[size]}
            height={svgSizes[size]}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-md transition-all duration-300"
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
              fill="url(#robotHeadGradient)"
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
                <circle cx="42" cy="45" r="4" fill="#10b981" className="animate-pulse" />
                <circle cx="58" cy="45" r="4" fill="#10b981" className="animate-pulse" />
                <path d="M 36 49 Q 50 55 64 49" stroke="#10b981" strokeWidth="2" fill="none" strokeLinecap="round" />
              </>
            )}

            {isListening && (
              <>
                <circle cx="40" cy="45" r="4" fill="#60a5fa" />
                <circle cx="60" cy="45" r="4" fill="#60a5fa" />
                <line x1="34" y1="45" x2="66" y2="45" stroke="#93c5fd" strokeWidth="1" strokeDasharray="2 2" />
              </>
            )}

            {isConnecting && (
              <>
                <circle cx="50" cy="45" r="5" fill="#f59e0b" className="animate-ping" />
                <line x1="32" y1="45" x2="68" y2="45" stroke="#fbbf24" strokeWidth="2" />
              </>
            )}

            {state === 'ready' && (
              <>
                <circle cx="40" cy="44" r="4" fill="#38bdf8" />
                <circle cx="60" cy="44" r="4" fill="#38bdf8" />
                <path d="M 44 49 Q 50 53 56 49" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" fill="none" />
              </>
            )}

            {state === 'ended' && (
              <>
                <path d="M 36 45 Q 40 48 44 45" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="none" />
                <path d="M 56 45 Q 60 48 64 45" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" fill="none" />
              </>
            )}

            {state === 'error' && (
              <>
                <path d="M 36 41 L 44 47 M 44 41 L 36 47" stroke="#ef4444" strokeWidth="2" />
                <path d="M 56 41 L 64 47 M 64 41 L 56 47" stroke="#ef4444" strokeWidth="2" />
              </>
            )}

            {/* Neck Joint */}
            <rect x="42" y="68" width="16" height="8" rx="2" fill="#0284c7" />

            {/* Robot Torso Base */}
            <path
              d="M 28 76 L 72 76 L 68 94 L 32 94 Z"
              fill="url(#robotTorsoGradient)"
              stroke="#0284c7"
              strokeWidth="2"
            />

            {/* Chest Reactor Core / Sentinel Emblem */}
            <circle cx="50" cy="85" r="5" fill={current.core} stroke={current.visor} strokeWidth="1.5" />
            <path d="M 50 81 L 50 89 M 46 85 L 54 85" stroke="#ffffff" strokeWidth="1" />

            {/* Gradients */}
            <defs>
              <linearGradient id="robotHeadGradient" x1="24" y1="24" x2="76" y2="68" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" />
                <stop offset="1" stopColor="#e0f2fe" />
              </linearGradient>
              <linearGradient id="robotTorsoGradient" x1="28" y1="76" x2="72" y2="94" gradientUnits="userSpaceOnUse">
                <stop stopColor="#f0f9ff" />
                <stop offset="1" stopColor="#bae6fd" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {/* CHARACTER 2: SHELTER SPECIALIST - Orange / Green Relief Center / Emergency Tent Icon */}
        {isShelter && (
          <svg
            width={svgSizes[size]}
            height={svgSizes[size]}
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="filter drop-shadow-md transition-all duration-300"
          >
            {/* Emergency Alert Beacon at Apex */}
            <circle cx="50" cy="14" r="5" fill="#f97316" className={cn(isSpeaking || isListening ? 'animate-ping' : '')} />
            <line x1="50" y1="19" x2="50" y2="26" stroke="#ea580c" strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="14" r="2.5" fill="#fef08a" />

            {/* Radio Relief Arcs */}
            <path d="M 38 10 Q 50 4 62 10" stroke="#f97316" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
            <path d="M 32 6 Q 50 -2 68 6" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />

            {/* Tent Base Ground Shadow */}
            <ellipse cx="50" cy="90" rx="38" ry="6" fill="#047857" opacity="0.25" />

            {/* Emergency Relief Tent Canopy Roof */}
            <path
              d="M 50 24 L 88 84 L 50 78 L 12 84 Z"
              fill="url(#tentRoofGrad)"
              stroke="#ea580c"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Left & Right Canopy Facets */}
            <path d="M 50 24 L 12 84 L 50 78 Z" fill="url(#tentLeftFacetGrad)" opacity="0.95" />
            <path d="M 50 24 L 88 84 L 50 78 Z" fill="url(#tentRightFacetGrad)" />

            {/* Green Structural Support Pillars & Arches */}
            <path d="M 50 24 L 50 78" stroke="#059669" strokeWidth="3" strokeLinecap="round" />
            <path d="M 12 84 L 50 78 L 88 84" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* Illuminated Tent Doorway Entrance */}
            <path
              d="M 36 78 Q 50 44 64 78 Z"
              fill="url(#shelterDoorwayGrad)"
              stroke="#10b981"
              strokeWidth="2"
            />

            {/* Emergency Relief Cross / Heart Shield Emblem above Entrance */}
            <circle cx="50" cy="46" r="8" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
            {/* Green Cross Symbol */}
            <rect x="48" y="41" width="4" height="10" rx="1" fill="#ffffff" />
            <rect x="45" y="44" width="10" height="4" rx="1" fill="#ffffff" />

            {/* Active Voice Equalizer / Pulse inside Doorway */}
            {isSpeaking && (
              <path d="M 40 68 Q 50 58 60 68" stroke="#047857" strokeWidth="2.5" fill="none" strokeLinecap="round" className="animate-pulse" />
            )}
            {isListening && (
              <circle cx="50" cy="66" r="3" fill="#f97316" className="animate-ping" />
            )}
            {state === 'ready' && (
              <circle cx="50" cy="66" r="3" fill="#10b981" />
            )}

            {/* Gradients */}
            <defs>
              <linearGradient id="tentRoofGrad" x1="50" y1="24" x2="50" y2="84" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fb923c" />
                <stop offset="1" stopColor="#ea580c" />
              </linearGradient>
              <linearGradient id="tentLeftFacetGrad" x1="12" y1="24" x2="50" y2="84" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fdba74" />
                <stop offset="1" stopColor="#f97316" />
              </linearGradient>
              <linearGradient id="tentRightFacetGrad" x1="88" y1="24" x2="50" y2="84" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ea580c" />
                <stop offset="1" stopColor="#c2410c" />
              </linearGradient>
              <linearGradient id="shelterDoorwayGrad" x1="50" y1="44" x2="50" y2="78" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" />
                <stop offset="0.6" stopColor="#ecfdf5" />
                <stop offset="1" stopColor="#a7f3d0" />
              </linearGradient>
            </defs>
          </svg>
        )}

        {/* Voice AI Name Tag Badge - Perfectly Centered */}
        <div className={cn('absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap border px-3 py-0.5 rounded-full shadow-md text-[9px] font-mono font-bold tracking-widest uppercase flex items-center gap-1.5 backdrop-blur-md z-20 transition-all duration-300', current.badgeBg)}>
          <span className={cn('w-1.5 h-1.5 rounded-full inline-block', isSpeaking ? (isShelter ? 'bg-orange-300 animate-ping' : 'bg-emerald-500 animate-ping') : isListening ? 'bg-blue-300' : isConnecting ? 'bg-amber-300' : 'bg-emerald-300')} />
          {current.badgeText}
        </div>
      </div>
    </div>
  );
}
