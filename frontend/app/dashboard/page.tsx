'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  PhoneCall,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  Lock,
  Activity,
  Radio,
  FileCheck,
  AlertCircle,
  RotateCcw,
  Clock,
  User,
  History,
  PhoneIncoming,
  PhoneOutgoing
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BharatBackground } from '@/components/app/bharat-background';

interface CallMetrics {
  total_calls: number;
  successful_calls: number;
  failed_calls: number;
  success_rate: number;
}

interface CallRecord {
  call_id: string;
  caller_name: string;
  call_type: string;
  status: string;
  outcome_reason: string;
  duration_seconds: number;
  started_at?: string;
  ended_at?: string;
}

/* Circular Success Rate Gauge Component */
function CircularSuccessGauge({
  successRate,
  totalCalls,
  successfulCalls,
  failedCalls,
}: {
  successRate: number;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // ~251.327
  const strokeDashoffset = circumference - (successRate / 100) * circumference;
  const isNoCalls = totalCalls === 0;

  return (
    <div className="p-5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm flex flex-col items-center justify-center relative overflow-hidden group hover:shadow-md transition-all">
      <div className="w-full flex items-center justify-between text-slate-500 text-xs font-mono mb-2">
        <span>SUCCESS RATE GAUGE</span>
        <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
      </div>

      <div className="relative w-32 h-32 flex items-center justify-center my-1">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Base Track Line: Red Line when calls fail/not received, gray when no calls */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={isNoCalls ? 'stroke-slate-200' : 'stroke-red-500'}
            strokeWidth="9"
            fill="transparent"
          />

          {/* Overlay Progress Line: Green Line when calls are received successfully */}
          {!isNoCalls && successRate > 0 && (
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-emerald-500 transition-all duration-700 ease-out"
              strokeWidth="9"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          )}
        </svg>

        {/* Center Text inside Circle */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none">
          <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">
            {successRate}%
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mt-1">
            SUCCESS
          </span>
        </div>
      </div>

      {/* Legend Indicators Below Circle */}
      <div className="w-full pt-2 flex items-center justify-around text-[11px] font-mono border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
          <span>Received: {successfulCalls}</span>
        </div>
        <div className="flex items-center gap-1.5 text-rose-700 font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-xs" />
          <span>Failed: {failedCalls}</span>
        </div>
      </div>
    </div>
  );
}

export default function CallAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<CallMetrics>({
    total_calls: 0,
    successful_calls: 0,
    failed_calls: 0,
    success_rate: 0.0,
  });
  const [recentCalls, setRecentCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.success) {
        if (data.metrics) setMetrics(data.metrics);
        if (Array.isArray(data.recent_calls)) setRecentCalls(data.recent_calls);
      }
    } catch (err) {
      console.error('Failed to fetch call dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all call history metrics to zero?')) return;
    try {
      await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to reset dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    if (!seconds || seconds <= 0) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const formatDate = (isoStr: string | undefined) => {
    if (!isoStr) return 'N/A';
    try {
      const date = new Date(isoStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="relative min-h-screen text-slate-900 p-4 md:p-8 font-sans overflow-x-hidden selection:bg-sky-500/30">
      {/* Voice for Bharat Background Theme with Moving Ashoka Chakra */}
      <BharatBackground />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6 pt-9">

        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200/80 bg-white/70 backdrop-blur-md p-5 rounded-2xl shadow-xs">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <Link
                href="/"
                className="p-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-all shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-sky-600 animate-pulse" />
                <span>Sentinel Disaster Agent Call Dashboard</span>
              </h1>
            </div>
            <p className="text-xs font-mono text-slate-600 pl-11">
              Voice for Bharat • Real-time Browser & SIP Call Analytics Engine
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/escalations">
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 bg-amber-50/90 text-amber-900 hover:bg-amber-100 font-mono text-xs shadow-xs"
              >
                <Activity className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                Escalation Dispatcher
              </Button>
            </Link>

            <Button
              onClick={fetchDashboardData}
              variant="outline"
              size="sm"
              className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-mono text-xs shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-sky-600 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="border-rose-300 bg-rose-50/90 text-rose-900 hover:bg-rose-100 font-mono text-xs shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
              Reset Call History
            </Button>
          </div>
        </header>

        <main className="space-y-6">
          {/* Disaster Response Standard Banner */}
          <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <FileCheck className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <h2 className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">
                  Success Criteria Standard (Disaster Response)
                </h2>
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed font-medium">
                  <strong>A call is marked SUCCESSFUL</strong> when the caller receives verified information (weather, flood advisory, relief centers) or a human-help escalation request is created.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-300 shrink-0 font-bold shadow-xs">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-ping" />
              <span>Success Rate: {metrics.success_rate}%</span>
            </div>
          </div>

          {/* 4 Metrics Cards Grid (Including requested Circular Gauge) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Card 1: Total Calls */}
            <div className="p-5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm relative overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-slate-500 text-xs font-mono mb-2">
                  <span>TOTAL CALLS</span>
                  <PhoneCall className="w-5 h-5 text-sky-600" />
                </div>
                <div className="text-4xl font-black text-slate-900 font-mono tracking-tight">
                  {metrics.total_calls}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-3">
                Total inbound browser & outbound SIP calls
              </p>
            </div>

            {/* Card 2: Successful Calls */}
            <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 shadow-sm relative overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-emerald-800 text-xs font-mono mb-2">
                  <span>SUCCESSFUL CALLS</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-4xl font-black text-emerald-700 font-mono tracking-tight">
                  {metrics.successful_calls}
                </div>
              </div>
              <p className="text-[11px] text-emerald-800/80 font-mono mt-3">
                Verified info delivered or escalation created
              </p>
            </div>

            {/* Card 3: Failed Calls */}
            <div className="p-5 rounded-2xl bg-rose-50/80 border border-rose-200/90 shadow-sm relative overflow-hidden group hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-rose-800 text-xs font-mono mb-2">
                  <span>FAILED CALLS</span>
                  <XCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div className="text-4xl font-black text-rose-700 font-mono tracking-tight">
                  {metrics.failed_calls}
                </div>
              </div>
              <p className="text-[11px] text-rose-800/80 font-mono mt-3">
                Call ended before reaching success criteria
              </p>
            </div>

            {/* Card 4: Requested Circular Success Rate Gauge */}
            <CircularSuccessGauge
              successRate={metrics.success_rate}
              totalCalls={metrics.total_calls}
              successfulCalls={metrics.successful_calls}
              failedCalls={metrics.failed_calls}
            />

          </div>

          {/* Call History Records Matrix Table */}
          <div className="rounded-3xl bg-white/90 border border-slate-200/90 shadow-md backdrop-blur-md overflow-hidden">
            <div className="p-5 md:p-6 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-300 text-sky-600">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>Recent Call History & Outcome Logs</span>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-bold">
                      {recentCalls.length} calls recorded
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Detailed real-time logs of inbound browser and outbound SIP dispatch calls
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              {recentCalls.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <PhoneCall className="w-10 h-10 text-slate-300 mx-auto animate-bounce" />
                  <h3 className="text-sm font-bold text-slate-700">No Call Records Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto font-mono">
                    Make an emergency voice call or initiate an outbound dispatch call to record call telemetry here.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-mono font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3.5 px-4 md:px-6">Caller / ID</th>
                      <th className="py-3.5 px-4">Channel</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Duration</th>
                      <th className="py-3.5 px-4">Outcome & Notes</th>
                      <th className="py-3.5 px-4 md:px-6 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-sans">
                    {recentCalls.map((call) => {
                      const isSuccess = call.status.toUpperCase() === 'SUCCESS';
                      return (
                        <tr key={call.call_id} className="hover:bg-slate-50/80 transition-colors">
                          {/* Caller & ID */}
                          <td className="py-4 px-4 md:px-6">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-xl border ${isSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
                                <User className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-xs">{call.caller_name || 'Browser Caller'}</div>
                                <div className="text-[10px] font-mono text-slate-600 tracking-tight">{call.call_id}</div>
                              </div>
                            </div>
                          </td>

                          {/* Channel Type */}
                          <td className="py-4 px-4 font-mono">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${call.call_type === 'sip' ? 'bg-purple-50 text-purple-800 border-purple-200' : 'bg-sky-50 text-sky-800 border-sky-200'}`}>
                              {call.call_type === 'sip' ? <PhoneOutgoing className="w-3 h-3 text-purple-600" /> : <PhoneIncoming className="w-3 h-3 text-sky-600" />}
                              <span>{call.call_type.toUpperCase()}</span>
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-4 px-4 font-mono">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${isSuccess ? 'bg-emerald-100/80 text-emerald-900 border-emerald-300' : 'bg-rose-100/80 text-rose-900 border-rose-300'}`}>
                              {isSuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                              <span>{call.status}</span>
                            </span>
                          </td>

                          {/* Duration */}
                          <td className="py-4 px-4 font-mono font-bold text-slate-700">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formatDuration(call.duration_seconds)}</span>
                            </div>
                          </td>

                          {/* Outcome Reason */}
                          <td className="py-4 px-4 text-slate-600 max-w-xs font-medium truncate" title={call.outcome_reason}>
                            {call.outcome_reason || 'N/A'}
                          </td>

                          {/* Time */}
                          <td className="py-4 px-4 md:px-6 text-right font-mono text-slate-500 text-[11px]">
                            {formatDate(call.ended_at || call.started_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Disaster Command Message Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-white/90 border border-slate-200/90 shadow-sm space-y-4 text-center max-w-4xl mx-auto backdrop-blur-md">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-center text-amber-600 mx-auto shadow-xs">
              <ShieldCheck className="w-6 h-6 text-amber-600" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight">
                Sentinel National Disaster Relief Command System
              </h3>
              <p className="text-xs font-bold text-amber-600 font-sans">
                वॉइस फॉर भारत • रियल-टाइम आपातकालीन वॉइस सहायता कमान
              </p>
            </div>

            <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-medium max-w-2xl mx-auto">
              All inbound voice calls, weather advisories, relief shelter bed lookups, and human rescue escalations are processed in real-time. Strict PII sanitization protection is automatically enforced to protect caller privacy.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Command Telemetry Synchronized
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-300 text-sky-800 font-bold shadow-xs">
                <Lock className="w-3.5 h-3.5 text-sky-600" />
                Privacy & PII Sanitized
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

