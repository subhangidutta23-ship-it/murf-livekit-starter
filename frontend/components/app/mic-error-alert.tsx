'use client';

import React from 'react';
import { AlertTriangle, MicOff, RefreshCw, Lock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MicErrorAlertProps {
  onRetry?: () => void;
  onClose?: () => void;
}

export function MicErrorAlert({ onRetry, onClose }: MicErrorAlertProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-red-500/40 bg-gradient-to-b from-slate-900 via-slate-900 to-red-950/40 p-6 text-slate-100 shadow-2xl shadow-red-950/50">
        
        {/* Header Icon */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20 text-red-400 border border-red-500/40 mb-4 animate-bounce [animation-duration:2s]">
          <MicOff size={28} />
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-bold tracking-tight text-white md:text-2xl">
          Microphone Access Blocked
        </h2>
        <p className="mt-2 text-center text-sm text-slate-300">
          The Disaster Response System cannot receive your voice report or welfare check-in because microphone access was denied by your browser.
        </p>

        {/* Diagnostic Guide */}
        <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs md:text-sm text-slate-300 space-y-3">
          <p className="font-semibold text-amber-400 flex items-center gap-1.5">
            <Lock size={16} className="text-amber-400" />
            How to unblock your microphone:
          </p>

          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            <li className="leading-relaxed">
              Click the <strong className="text-white">Lock (🔒) or Camera/Mic icon</strong> on the left side of your browser address bar at the top of the screen.
            </li>
            <li className="leading-relaxed">
              Find <strong className="text-white">Microphone</strong> in the permission dropdown and change it to <strong className="text-emerald-400">Allow</strong>.
            </li>
            <li className="leading-relaxed">
              Click <strong className="text-white">Try Again</strong> below to re-initialize your emergency voice check-in.
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          {onRetry && (
            <Button
              size="lg"
              onClick={onRetry}
              className="w-full sm:w-auto bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-full px-8 shadow-lg shadow-red-900/40"
            >
              <RefreshCw size={18} className="mr-2 animate-spin [animation-duration:3s]" />
              Try Again & Grant Access
            </Button>
          )}

          {onClose && (
            <Button
              size="lg"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto border-slate-700 text-slate-300 hover:bg-slate-800 rounded-full px-6"
            >
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
