'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, AlertTriangle, CheckCircle, Clock, RefreshCw, ArrowLeft, PhoneCall, Lock, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BharatBackground } from '@/components/app/bharat-background';

interface EscalationTicket {
  ticket_id: string;
  user_id: string;
  caller_name: string;
  issue_type: string;
  summary: string;
  urgency_level: string;
  location: string;
  preferred_contact: string;
  status: string;
  resolution_notes: string;
  created_at: string;
  updated_at: string;
}

export default function EscalationsDashboard() {
  const [tickets, setTickets] = useState<EscalationTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/escalations');
      const data = await res.json();
      if (data.success && Array.isArray(data.tickets)) {
        setTickets(data.tickets);
      }
    } catch (err) {
      console.error('Failed to fetch escalation tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (ticketId: string) => {
    if (!confirm(`Mark Ticket ${ticketId} as RESOLVED and initiate outbound resolution callback?`)) {
      return;
    }
    setResolvingId(ticketId);
    try {
      const res = await fetch('/api/escalations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve',
          ticket_id: ticketId,
          resolution_notes: 'Resolved by dispatcher from Emergency Dashboard',
        }),
      });
      const data = await res.json();
      if (data.success) {
        fetchTickets();
      } else {
        alert(`Error resolving ticket: ${data.error}`);
      }
    } catch (err) {
      alert(`Failed to connect: ${err}`);
    } finally {
      setResolvingId(null);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (filter === 'ALL') return true;
    return t.status.toUpperCase() === filter;
  });

  const openCount = tickets.filter((t) => t.status === 'OPEN').length;
  const emergencyCount = tickets.filter((t) => ['EMERGENCY', 'HIGH', 'CRITICAL'].includes(t.urgency_level)).length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED').length;

  return (
    <div className="relative min-h-screen text-slate-900 p-4 md:p-8 font-sans overflow-x-hidden selection:bg-sky-500/30">
      {/* Voice for Bharat Background Theme with Moving Ashoka Chakra */}
      <BharatBackground />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6 pt-9">
        
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200/80 bg-white/70 backdrop-blur-md p-5 rounded-2xl shadow-xs">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <Link href="/" className="p-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-all shadow-xs">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-amber-600 animate-pulse" />
                <span>Sentinel Live Emergency Dispatcher Dashboard</span>
              </h1>
            </div>
            <p className="text-xs font-mono text-slate-600 pl-11">
              National Disaster Management Command • Real-time Human Escalation Feed
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="border-sky-300 bg-sky-50/90 text-sky-900 hover:bg-sky-100 font-mono text-xs shadow-xs"
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
                Call Metrics Dashboard
              </Button>
            </Link>

            <span className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-full text-xs font-mono font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>DB Live Sync Active</span>
            </span>

            <Button
              onClick={fetchTickets}
              variant="outline"
              size="sm"
              className="border-slate-300 bg-white text-slate-700 hover:bg-slate-100 font-mono text-xs shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-sky-600 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </header>

        <main className="space-y-6">
          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 text-xs font-mono mb-2">
                <span>ACTIVE OPEN REQUESTS</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-black text-amber-600 font-mono">{openCount}</div>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/80 border border-rose-200/90 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-rose-800 text-xs font-mono mb-2">
                <span>EMERGENCY URGENCY</span>
                <ShieldAlert className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl font-black text-rose-700 font-mono">{emergencyCount}</div>
            </div>

            <div className="p-5 rounded-2xl bg-sky-50/80 border border-sky-200/90 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-sky-800 text-xs font-mono mb-2">
                <span>IN PROGRESS</span>
                <Clock className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-3xl font-black text-sky-700 font-mono">{inProgressCount}</div>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-800 text-xs font-mono mb-2">
                <span>RESOLVED TICKETS</span>
                <CheckCircle className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-black text-emerald-700 font-mono">{resolvedCount}</div>
            </div>
          </div>

          {/* Filter Controls & PII Notice */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-2 bg-white/90 p-1.5 rounded-xl border border-slate-200/90 text-xs font-mono shadow-xs">
              {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    filter === status
                      ? 'bg-amber-500 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-300 px-3.5 py-1.5 rounded-xl font-bold shadow-xs">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>PII Redaction Active: Phone, Email, & IDs Automatically Masked</span>
            </div>
          </div>

          {/* Escalations Table */}
          <div className="bg-white/90 border border-slate-200/90 rounded-2xl overflow-hidden shadow-sm">
            {filteredTickets.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-mono text-xs">
                No escalation tickets found for filter standard: <span className="text-amber-600 font-bold">{filter}</span>.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100/90 text-slate-600 border-b border-slate-200 uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Ref ID</th>
                      <th className="py-3.5 px-4">Caller / Location</th>
                      <th className="py-3.5 px-4">Urgency</th>
                      <th className="py-3.5 px-4">Issue Details & Sanitized Summary</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Dispatch Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/80">
                    {filteredTickets.map((t) => (
                      <tr key={t.ticket_id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 font-bold text-amber-700 font-mono whitespace-nowrap">
                          {t.ticket_id}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900">{t.caller_name}</div>
                          <div className="text-slate-500 text-[11px]">{t.location || 'Not specified'}</div>
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              t.urgency_level === 'EMERGENCY' || t.urgency_level === 'HIGH' || t.urgency_level === 'CRITICAL'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : t.urgency_level === 'MEDIUM'
                                ? 'bg-amber-50 text-amber-800 border-amber-300'
                                : 'bg-sky-50 text-sky-800 border-sky-300'
                            }`}
                          >
                            {t.urgency_level}
                          </span>
                        </td>

                        <td className="py-4 px-4 max-w-md">
                          <div className="font-semibold text-slate-900 mb-1">{t.issue_type}</div>
                          <div className="text-slate-600 text-[11px] leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-200">
                            {t.summary}
                          </div>
                          {t.resolution_notes && (
                            <div className="mt-1.5 text-[10px] text-emerald-800 bg-emerald-50 p-1.5 rounded border border-emerald-300 font-medium">
                              <strong>Resolution Notes:</strong> {t.resolution_notes}
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                              t.status === 'OPEN'
                                ? 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse'
                                : t.status === 'IN_PROGRESS'
                                ? 'bg-sky-100 text-sky-900 border-sky-400'
                                : 'bg-emerald-100 text-emerald-900 border-emerald-400'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          {t.status !== 'RESOLVED' ? (
                            <Button
                              onClick={() => handleResolve(t.ticket_id)}
                              disabled={resolvingId === t.ticket_id}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[11px] px-3 py-1 rounded-lg flex items-center space-x-1.5 ml-auto shadow-sm"
                            >
                              <PhoneCall className="w-3.5 h-3.5" />
                              <span>{resolvingId === t.ticket_id ? 'Resolving...' : 'Resolve & Call Back'}</span>
                            </Button>
                          ) : (
                            <span className="text-slate-500 text-[11px] font-mono flex items-center justify-end space-x-1 font-semibold">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Callback Sent</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

