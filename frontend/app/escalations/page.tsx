'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, AlertTriangle, CheckCircle, Clock, RefreshCw, ArrowLeft, PhoneCall, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Top Bar */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-8 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <Link href="/" className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-amber-500 animate-pulse" />
              <span>Sentinel Live Emergency Dispatcher Dashboard</span>
            </h1>
          </div>
          <p className="text-xs font-mono text-slate-400 pl-11">
            National Disaster Management Command • Real-time Human Escalation Feed
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>DB Live Sync Active</span>
          </span>

          <Button
            onClick={fetchTickets}
            variant="outline"
            size="sm"
            className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800 font-mono text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>ACTIVE OPEN REQUESTS</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400 font-mono">{openCount}</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>HIGH / EMERGENCY URGENCY</span>
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <div className="text-3xl font-black text-red-400 font-mono">{emergencyCount}</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>IN PROGRESS</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-black text-sky-400 font-mono">{inProgressCount}</div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
              <span>RESOLVED TICKETS</span>
              <CheckCircle className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400 font-mono">{resolvedCount}</div>
          </div>
        </div>

        {/* Filter Controls & PII Notice */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center space-x-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filter === status
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-400/90 bg-emerald-950/40 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>PII Redaction Active: Phone, Email, & IDs Automatically Masked</span>
          </div>
        </div>

        {/* Escalations Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
          {filteredTickets.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-mono text-xs">
              No escalation tickets found for filter standard: <span className="text-amber-400 font-bold">{filter}</span>.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Ref ID</th>
                    <th className="py-3.5 px-4">Caller / Location</th>
                    <th className="py-3.5 px-4">Urgency</th>
                    <th className="py-3.5 px-4">Issue Details & Sanitized Summary</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Dispatch Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTickets.map((t) => (
                    <tr key={t.ticket_id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-bold text-amber-400 font-mono whitespace-nowrap">
                        {t.ticket_id}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-100">{t.caller_name}</div>
                        <div className="text-slate-400 text-[11px]">{t.location || 'Not specified'}</div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            t.urgency_level === 'EMERGENCY' || t.urgency_level === 'HIGH' || t.urgency_level === 'CRITICAL'
                              ? 'bg-red-950/90 text-red-300 border-red-500/40'
                              : t.urgency_level === 'MEDIUM'
                              ? 'bg-amber-950/90 text-amber-300 border-amber-500/40'
                              : 'bg-blue-950/90 text-blue-300 border-blue-500/40'
                          }`}
                        >
                          {t.urgency_level}
                        </span>
                      </td>

                      <td className="py-4 px-4 max-w-md">
                        <div className="font-semibold text-slate-200 mb-1">{t.issue_type}</div>
                        <div className="text-slate-400 text-[11px] leading-relaxed bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                          {t.summary}
                        </div>
                        {t.resolution_notes && (
                          <div className="mt-1.5 text-[10px] text-emerald-400 bg-emerald-950/30 p-1.5 rounded border border-emerald-500/20">
                            <strong>Resolution Notes:</strong> {t.resolution_notes}
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            t.status === 'OPEN'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse'
                              : t.status === 'IN_PROGRESS'
                              ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
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
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-[11px] px-3 py-1 rounded-lg flex items-center space-x-1.5 ml-auto shadow-md shadow-emerald-900/30"
                          >
                            <PhoneCall className="w-3.5 h-3.5" />
                            <span>{resolvingId === t.ticket_id ? 'Resolving...' : 'Resolve & Call Back'}</span>
                          </Button>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-mono flex items-center justify-end space-x-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
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
  );
}
