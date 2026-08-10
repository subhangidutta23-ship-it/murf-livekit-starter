'use client';

import React from 'react';
import { useVoiceAssistant, useRoomContext } from '@livekit/components-react';
import { SpeakerVisualizer } from '@/components/app/speaker-visualizer';
import { AgentStateIndicator } from '@/components/app/agent-state-indicator';
import { Button } from '@/components/ui/button';
import { PhoneOff, ShieldAlert, Radio } from 'lucide-react';

export function App({ appConfig }: { appConfig?: any }) {
  const voiceAssistant = useVoiceAssistant();
  const room = useRoomContext();

  const state = voiceAssistant?.state;
  const agentTranscriptions = voiceAssistant?.agentTranscriptions;

  const currentAgentState = (state || 'ready').toLowerCase() as
    | 'ready'
    | 'connecting'
    | 'listening'
    | 'speaking'
    | 'ended'
    | 'error';

  const handleEndCall = () => {
    if (room) {
      room.disconnect();
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 via-sky-50/50 to-blue-50 text-slate-900 font-sans flex flex-col items-center justify-between p-6">

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-4xl flex items-center justify-between py-3.5 px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl border border-amber-300/80 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-amber-500/20 via-sky-500/20 to-emerald-500/20 rounded-xl border border-amber-300/60 text-emerald-700 dark:text-emerald-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xs md:text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <span>🇮🇳 SENTINEL DISASTER RESPONSE</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/50">VOICE FOR BHARAT</span>
            </h1>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              राष्ट्रीय आपदा कमांड • Helpline: 112 / 1078
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase">
            Active Channel
          </span>
        </div>
      </header>

      {/* Central Visualizer Area */}
      <main className="my-auto py-8 flex flex-col items-center justify-center w-full max-w-2xl">
        <div className="mb-6">
          <AgentStateIndicator state={currentAgentState} />
        </div>

        {/* Sentinel Robot Avatar and Active Waveforms */}
        <div className="w-full bg-white/60 backdrop-blur-xl border border-sky-100 rounded-3xl p-8 shadow-xl shadow-sky-100/50 flex flex-col items-center justify-center">
          <SpeakerVisualizer state={currentAgentState} />
        </div>

        <p className="mt-6 text-xs font-mono text-slate-600 text-center max-w-md bg-white/80 border border-slate-200/60 px-4 py-2 rounded-full shadow-sm">
          {currentAgentState === 'listening' && '• Sentinel is listening to your voice report. Speak clearly...'}
          {currentAgentState === 'speaking' && '• Sentinel AI is dispatching emergency response instructions...'}
          {currentAgentState === 'connecting' && '• Establishing secure emergency relay channel...'}
          {currentAgentState === 'ready' && '• Sentinel Emergency AI is ready.'}
        </p>
      </main>

      {/* Live Transcript Stream */}
      {agentTranscriptions && agentTranscriptions.length > 0 && (
        <section className="w-full max-w-xl mb-6 p-4 bg-white/90 border border-slate-200/80 rounded-2xl shadow-sm text-xs font-mono">
          <div className="flex items-center space-x-2 text-slate-500 mb-2 border-b border-slate-100 pb-2 text-[10px] uppercase font-bold tracking-wider">
            <Radio className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
            <span>Real-time Disaster Log Stream</span>
          </div>
          <p className="text-slate-800 leading-relaxed">
            {agentTranscriptions[agentTranscriptions.length - 1]?.text}
          </p>
        </section>
      )}

      {/* Footer Controls */}
      <footer className="w-full max-w-md pb-4">
        <div className="flex items-center justify-center p-3 bg-white/90 border border-slate-200/80 rounded-full shadow-lg backdrop-blur-md">
          <Button
            onClick={handleEndCall}
            variant="destructive"
            className="px-8 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold tracking-wider flex items-center space-x-2 shadow-md shadow-red-200 transition-all"
          >
            <PhoneOff className="w-4 h-4" />
            <span>END CALL</span>
          </Button>
        </div>
      </footer>

    </div>
  );
}

export default App;
