'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { DisasterAvatar } from '@/components/app/disaster-avatar';
import Link from 'next/link';
import {
  ShieldAlert,
  PhoneCall,
  Waves,
  Sun,
  HeartHandshake,
  BarChart3,
  Activity,
  Phone,
} from 'lucide-react';

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
  ref?: React.Ref<HTMLDivElement>;
}

export const WelcomeView = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'> & WelcomeViewProps>(
  ({ startButtonText, onStartCall }, ref) => {
    return (
      <div
        ref={ref}
        className="relative z-10 w-full min-h-screen flex flex-col items-center justify-between text-slate-900 overflow-x-hidden selection:bg-sky-500/30 select-none pb-8"
      >
        {/* Header Navigation Bar */}
        <header className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between border-b border-slate-200/80 backdrop-blur-md bg-white/70 sticky top-9 z-40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-emerald-600 p-[1.5px] shadow-md">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <span className="text-lg">🇮🇳</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm md:text-base tracking-tight text-slate-900">
                  Sentinel<span className="text-sky-600 font-normal">Command</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-[10px] font-mono font-bold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  LIVE RELAY
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-500">
                Voice for Bharat • राष्ट्रीय आपदा कमान केंद्र
              </p>
            </div>
          </div>

          {/* Quick Header Nav Options */}
          <div className="flex items-center gap-2.5">
            <Link href="/dashboard" className="hidden sm:block">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-300 bg-white/90 text-slate-700 hover:text-slate-900 hover:bg-slate-100 font-mono text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs"
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
                <span>Call Metrics</span>
              </Button>
            </Link>
            <Link href="/escalations" className="hidden sm:block">
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 bg-amber-50/80 text-amber-900 hover:bg-amber-100 font-mono text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs"
              >
                <Activity className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                <span>Dispatch Dashboard</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Center Content */}
        <main className="w-full max-w-5xl mx-auto px-4 py-8 md:py-12 flex-1 flex flex-col items-center justify-center text-center space-y-6">
          
          {/* Top Category Pill Badge */}
          <div className="inline-flex flex-col items-center px-4 py-1.5 rounded-full border border-amber-300/90 bg-white/95 shadow-sm text-xs font-mono font-bold tracking-wide">
            <span className="text-slate-800">IN <span className="text-amber-600 font-extrabold">VOICE FOR BHARAT</span></span>
            <span className="text-[10px] text-emerald-700 font-sans font-medium">राष्ट्रीय आपदा कमांड</span>
          </div>

          {/* Perfectly Centered Sentinel Robot Avatar */}
          <div className="w-full flex items-center justify-center my-3 group">
            <div className="transform group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
              <DisasterAvatar state="ready" size="lg" />
            </div>
          </div>

          {/* Main Title & Hindi Subheading */}
          <div className="space-y-1.5 max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Sentinel AI Emergency & Relief Assistant
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-amber-600 tracking-wide font-sans">
              वॉइस फॉर भारत • आपदा राहत एवं आपातकालीन सहायता प्रणाली
            </p>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-normal pt-1">
              Report flood emergencies, request drought relief, locate shelters, or check family safety hands-free. You can talk directly with the agent.
            </p>
          </div>

          {/* Emergency Hotlines Pill */}
          <div className="px-5 py-2 rounded-full border border-amber-200/90 bg-white/95 shadow-md backdrop-blur-md flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-700">
            <span className="flex items-center gap-1.5 text-rose-600 font-bold">
              <Phone className="w-3.5 h-3.5" /> Helpline: <strong className="text-slate-900 font-extrabold">112</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 text-sky-600 font-bold">
              <Waves className="w-3.5 h-3.5" /> NDRF: <strong className="text-slate-900 font-extrabold">1078</strong>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <ShieldAlert className="w-3.5 h-3.5" /> Medical: <strong className="text-slate-900 font-extrabold">108</strong>
            </span>
          </div>

          {/* 4 Feature Service Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full max-w-4xl pt-4">
            
            {/* Card 1: Flood Alerts */}
            <Link href="/services/flood-alerts" className="w-full">
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-300 flex flex-col items-center text-center space-y-2 group cursor-pointer h-full">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Waves className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    Flood Alerts
                  </h3>
                  <p className="text-[11px] text-amber-600 font-sans font-medium">
                    बाढ़ चेतावनी
                  </p>
                </div>
              </div>
            </Link>

            {/* Card 2: Drought Relief */}
            <Link href="/services/drought-relief" className="w-full">
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-amber-400 transition-all duration-300 flex flex-col items-center text-center space-y-2 group cursor-pointer h-full">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                  <Sun className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                    Drought Relief
                  </h3>
                  <p className="text-[11px] text-amber-600 font-sans font-medium">
                    सूखा राहत
                  </p>
                </div>
              </div>
            </Link>

            {/* Card 3: Relief Shelters */}
            <Link href="/services/relief-shelters" className="w-full">
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-emerald-400 transition-all duration-300 flex flex-col items-center text-center space-y-2 group cursor-pointer h-full">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                    Relief Shelters
                  </h3>
                  <p className="text-[11px] text-amber-600 font-sans font-medium">
                    राहत शिविर एवं बेड
                  </p>
                </div>
              </div>
            </Link>

            {/* Card 4: Welfare Check */}
            <Link href="/services/welfare-check" className="w-full">
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-sky-400 transition-all duration-300 flex flex-col items-center text-center space-y-2 group cursor-pointer h-full">
                <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 group-hover:scale-110 transition-transform">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                    Welfare Check
                  </h3>
                  <p className="text-[11px] text-amber-600 font-sans font-medium">
                    सुरक्षा चेक-इन
                  </p>
                </div>
              </div>
            </Link>

          </div>

          {/* Call Action Section */}
          <div className="pt-4 flex flex-col items-center space-y-3 w-full max-w-lg">
            {/* Ready Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-mono font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>SENTINEL ROBOT READY</span>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Sentinel Robot online. Click below to begin disaster report.
            </p>

            {/* Big Gradient Call Button with Hindi Text Below English in Smaller Font Size */}
            <Button
              size="lg"
              onClick={onStartCall}
              className="w-full rounded-full bg-gradient-to-r from-amber-500 via-teal-600 to-sky-600 hover:from-amber-600 hover:to-sky-700 text-white shadow-xl shadow-teal-600/20 py-7 px-8 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-white/40 cursor-pointer"
            >
              <div className="flex items-center justify-center gap-3">
                <PhoneCall className="h-5 w-5 text-white animate-bounce shrink-0" />
                <div className="flex flex-col items-center leading-tight">
                  <span className="font-mono text-sm sm:text-base font-extrabold tracking-wider uppercase">
                    START EMERGENCY CALL
                  </span>
                  <span className="text-[11px] font-sans font-normal opacity-90 tracking-normal text-sky-100">
                    आपातकालीन कॉल
                  </span>
                </div>
              </div>
            </Button>

            {/* Mobile Nav Links */}
            <div className="flex sm:hidden items-center gap-2 pt-2 w-full">
              <Link href="/dashboard" className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-slate-300 bg-white text-slate-700 font-mono text-xs py-2 rounded-xl"
                >
                  <BarChart3 className="w-3.5 h-3.5 mr-1 text-sky-600" />
                  Metrics
                </Button>
              </Link>
              <Link href="/escalations" className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-amber-300 bg-amber-50 text-amber-900 font-mono text-xs py-2 rounded-xl"
                >
                  <Activity className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  Dispatch
                </Button>
              </Link>
            </div>
          </div>

        </main>

        {/* Footer */}
        <footer className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-4 pb-2 border-t border-slate-200/80 text-xs font-mono text-slate-500 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Voice for Bharat • National Disaster Relief Command System</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
              Call Metrics
            </Link>
            <span className="text-slate-300">•</span>
            <Link href="/escalations" className="hover:text-slate-900 transition-colors">
              Dispatch Dashboard
            </Link>
          </div>
        </footer>

      </div>
    );
  }
);

WelcomeView.displayName = 'WelcomeView';
