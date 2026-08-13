'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Waves,
  Sun,
  ShieldAlert,
  HeartHandshake,
  ArrowLeft,
  Phone,
  MapPin,
  Activity,
  CheckCircle2,
  Radio,
  Building2,
  Users,
  AlertTriangle,
  FileText,
  BarChart3,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BharatBackground } from '@/components/app/bharat-background';

/* 4 Service Definitions */
const SERVICES_DATA: Record<string, {
  id: string;
  title: string;
  hindiTitle: string;
  subtitle: string;
  icon: any;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  stats: { label: string; value: string; sub: string }[];
  scenarios: {
    id: string;
    location: string;
    state: string;
    status: string;
    statusColor: string;
    title: string;
    details: string;
    metrics: string;
    action: string;
  }[];
}> = {
  'flood-alerts': {
    id: 'flood-alerts',
    title: 'India Live Flood Telemetry & District Alerts',
    hindiTitle: 'भारत बाढ़ चेतावनी एवं लाइव जलस्तर सूचना प्रणाली',
    subtitle: 'Real-time river discharge rates, IMD heavy rainfall advisories, and district flood watches across India.',
    icon: Waves,
    color: 'text-sky-600',
    badgeBg: 'bg-sky-50',
    badgeBorder: 'border-sky-300',
    badgeText: 'text-sky-800',
    stats: [
      { label: 'Active Red Alert Districts', value: '14 Districts', sub: 'Patna, Wayanad, Cachar, Delhi, Konkan' },
      { label: 'Rivers Above Danger Mark', value: '6 Rivers', sub: 'Ganga, Yamuna, Brahmaputra, Kosi, Teesta, Periyar' },
      { label: 'Evacuation Advisories', value: '45,000+', sub: 'Citizens notified via SMS & Voice AI' },
    ],
    scenarios: [
      {
        id: 'fl-1',
        location: 'Patna & North Bihar Basin',
        state: 'Bihar',
        status: 'RED ALERT • CRITICAL FLOOD',
        statusColor: 'bg-rose-50 text-rose-800 border-rose-300',
        title: 'Ganga & Kosi River Stage Level +4.2ft Above Danger Mark',
        details: 'Heavy water discharge from Farakka & Kosi barrages. Low-lying areas in Patna Sector 4, Danapur, and Hajipur under 3.5ft flood waters. NDRF 9th Battalion deployed with 32 inflatable rescue boats.',
        metrics: 'River Flow: 1,450 m³/s • Precip: 85mm/24hr',
        action: 'NDRF Rescue Active • Call 1078',
      },
      {
        id: 'fl-2',
        location: 'Yamuna Corridor (Kashmere Gate)',
        state: 'Delhi / NCR',
        status: 'ORANGE ALERT • FLOOD WATCH',
        statusColor: 'bg-amber-50 text-amber-900 border-amber-300',
        title: 'Yamuna River Water Level at 206.4 Meters (Old Bridge)',
        details: 'Hathnikund Barrage in Haryana releasing 1.8 Lakh Cusecs of water. Monastery Market, Yamuna Bazaar, and Geeta Colony low-lying enclaves evacuated to high-ground relief tents.',
        metrics: 'Discharge: 180,000 cusecs • Trend: Rising',
        action: 'Relief Tents Open • Call 112',
      },
      {
        id: 'fl-3',
        location: 'Wayanad & High Ranges',
        state: 'Kerala',
        status: 'RED ALERT • LANDSLIDE RISK',
        statusColor: 'bg-rose-50 text-rose-800 border-rose-300',
        title: 'Torrential Rainfall & Banasura Sagar Dam Gate Level 2 Release',
        details: 'Wayanad hilly terrain recorded 240mm extreme rainfall in 24 hours. SDRF quick-response teams deployed for slope stabilization and valley evacuation.',
        metrics: 'Rainfall: 240mm/24hr • Wind: 45 km/h',
        action: 'Emergency Shelters Active',
      },
      {
        id: 'fl-4',
        location: 'Silchar & Cachar Valley',
        state: 'Assam',
        status: 'RED ALERT • BRAHMAPUTRA FLOOD',
        statusColor: 'bg-rose-50 text-rose-800 border-rose-300',
        title: 'Brahmaputra & Barak River Flow 1.2m Above Danger Level',
        details: '18 districts in Assam affected. Kaziranga wildlife protection corridor flooded. SDRF and Indian Army 4 Corps engineering units staging amphibian rescue vehicles.',
        metrics: 'Discharge: 2,100 m³/s • Inundated: 420 Villages',
        action: 'Relief Air-Drops • Call 1078',
      },
      {
        id: 'fl-5',
        location: 'Coastal Konkan & Mumbai (Mithi River)',
        state: 'Maharashtra',
        status: 'YELLOW ALERT • HIGH TIDE WATCH',
        statusColor: 'bg-sky-50 text-sky-800 border-sky-300',
        title: 'High Tide Warning 4.8m Combined with Intense Rain Spells',
        details: 'Mithi river level at 2.8m. Stormwater pumping stations in Hindmata, Kurla, and Chunabhatti operating at 100% capacity. Disaster control room monitoring 24/7.',
        metrics: 'Tide Height: 4.8m • Pumping: 100% Active',
        action: 'Control Room Active • Call 1916',
      },
    ],
  },
  'drought-relief': {
    id: 'drought-relief',
    title: 'India Drought & Emergency Water Rationing Network',
    hindiTitle: 'भारत सूखा राहत एवं आपातकालीन जल आपूर्ति नेटवर्क',
    subtitle: 'Live drought advisories, emergency water tanker ration distribution points, reservoir storage levels, and farmer aid across India.',
    icon: Sun,
    color: 'text-amber-600',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-300',
    badgeText: 'text-amber-900',
    stats: [
      { label: 'Drought Affected Districts', value: '28 Districts', sub: 'Marathwada, Bundelkhand, Vidarbha, Rajasthan' },
      { label: 'Daily Water Tankers Running', value: '3,420 Tankers', sub: '24/7 emergency water supply distribution' },
      { label: 'Farmers Receiving Direct Aid', value: '1.2 Lakh', sub: 'Fodder camps & crop loss compensation' },
    ],
    scenarios: [
      {
        id: 'dr-1',
        location: 'Latur, Jalna, Beed & Nanded',
        state: 'Marathwada, Maharashtra',
        status: 'EXTREME DROUGHT ADVISORY',
        statusColor: 'bg-amber-100 text-amber-950 border-amber-400',
        title: 'Groundwater Table Depleted 48% Below 10-Year Average',
        details: '850 emergency drinking water tankers deployed across 420 villages. Jaldoot emergency water train on 6-hour standby at Miraj railway hub. Free fodder camps established for 45,000 cattle.',
        metrics: 'Reservoir Level: 14% • Tankers: 850 Active',
        action: 'Water Tanker Relay • Call 112',
      },
      {
        id: 'dr-2',
        location: 'Jhansi, Banda, Mahoba & Hamirpur',
        state: 'Bundelkhand, Uttar Pradesh',
        status: 'SEVERE WATER SHORTAGE',
        statusColor: 'bg-rose-50 text-rose-800 border-rose-300',
        title: 'Deep Borewell Depletion & Surface Reservoir Storage Deficit',
        details: 'Jal Jeevan Mission emergency solar-powered water pumping stations installed across 140 drought-hit panchayats. Mobile water testing labs verifying potability.',
        metrics: 'Storage Deficit: -62% • Solar Pumps: 140',
        action: 'Solar Water Station Active',
      },
      {
        id: 'dr-3',
        location: 'Jaisalmer & Barmer Desert Sector',
        state: 'Rajasthan',
        status: 'EXTREME HEAT & CANAL DEFICIT',
        statusColor: 'bg-amber-100 text-amber-950 border-amber-400',
        title: 'Peak Temperature 44°C with Indira Gandhi Canal Maintenance Rations',
        details: 'Rationed drinking water supply scheduled every 48 hours. Emergency livestock hydration centers operating along cattle migration routes near Pokhran and Balotra.',
        metrics: 'Temp: 44°C • Rationing: 48hr Cycle',
        action: 'Cattle Hydration Stations Active',
      },
      {
        id: 'dr-4',
        location: 'Nagpur, Yavatmal & Chandrapur',
        state: 'Vidarbha, Maharashtra',
        status: 'MODERATE DROUGHT WATCH',
        statusColor: 'bg-sky-50 text-sky-800 border-sky-300',
        title: 'Monsoon Deficit (-32%) Affecting Soybean & Cotton Belt',
        details: 'State Disaster Relief Fund (SDRF) sanctioning direct crop damage aid to 68,000 smallholder farmers. Micro-irrigation sprinkler kits distributed to 1,200 cooperative clusters.',
        metrics: 'Rainfall Deficit: -32% • Aid Beneficiaries: 68,000',
        action: 'Farmer Aid Disbursement Active',
      },
    ],
  },
  'relief-shelters': {
    id: 'relief-shelters',
    title: 'Emergency Relief Shelters & Bed Capacity Directory',
    hindiTitle: 'भारत आपातकालीन राहत शिविर एवं बेड डायरेक्टरी',
    subtitle: 'Live state-wise emergency shelter locations, available bed capacity, medical facilities, and emergency contact hotlines.',
    icon: ShieldAlert,
    color: 'text-emerald-600',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-300',
    badgeText: 'text-emerald-800',
    stats: [
      { label: 'Total Active Relief Centers', value: '1,250 Centers', sub: 'Across 16 hazard-prone Indian states' },
      { label: 'Shelter Beds Available Now', value: '1,500+ Beds', sub: 'Real-time bed tracker database' },
      { label: 'Occupancy Rate', value: '58% Occupied', sub: '42% emergency reserve capacity' },
    ],
    scenarios: [
      {
        id: 'sh-1',
        location: 'Patna Central High Emergency Relief Shelter',
        state: 'Bihar',
        status: 'OPEN • 180 BEDS AVAILABLE',
        statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        title: 'Frazer Road, Patna (Capacity: 500 Beds | Occupied: 320)',
        details: 'Equipped with Medical Trauma Unit, Emergency Generators, Purified Water Plant, and 24/7 Food Ration Counter. Managed by Bihar State Disaster Management Authority.',
        metrics: 'Beds Free: 180 / 500 • Medical Staff: 12 On Duty',
        action: 'Helpline: 0612-220011',
      },
      {
        id: 'sh-2',
        location: 'Dharavi Community Disaster Evacuation Center',
        state: 'Mumbai, Maharashtra',
        status: 'OPEN • 350 BEDS AVAILABLE',
        statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        title: 'Sion West, Mumbai (Capacity: 1,000 Beds | Occupied: 650)',
        details: 'Equipped with First Aid Clinic, Hot Meals Kitchen, Child Care Enclave, and Boat Rescue Staging Post. Direct coordination with BMC Disaster Management Cell.',
        metrics: 'Beds Free: 350 / 1000 • Rescue Boats: 6 Staged',
        action: 'Helpline: 022-240033',
      },
      {
        id: 'sh-3',
        location: 'Yamuna Flood Relief Enclave',
        state: 'Delhi / Old Delhi',
        status: 'OPEN • 400 BEDS AVAILABLE',
        statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        title: 'Kashmere Gate, Old Delhi (Capacity: 800 Beds | Occupied: 400)',
        details: 'Equipped with Emergency Medical Doctors, Dry Food Packets, Solar Power Backup, and ORS Distribution Point. Administered by Delhi Revenue Department.',
        metrics: 'Beds Free: 400 / 800 • Doctors: 8 On Duty',
        action: 'Helpline: 011-239900',
      },
      {
        id: 'sh-4',
        location: 'Silchar Town Hall Emergency Shelter',
        state: 'Cachar, Assam',
        status: 'OPEN • 210 BEDS AVAILABLE',
        statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        title: 'Circuit House Road, Silchar (Capacity: 600 Beds | Occupied: 390)',
        details: 'Equipped with Maternal & Child Care Unit, Clean Drinking Water Storage, and SDRF Base Camp. Water purification tablets distributed daily.',
        metrics: 'Beds Free: 210 / 600 • SDRF Team: 24 Personnel',
        action: 'Helpline: 03842-225544',
      },
    ],
  },
  'welfare-check': {
    id: 'welfare-check',
    title: 'Human Welfare Check-Ins & Rescue Dispatch Network',
    hindiTitle: 'सुरक्षा चेक-इन एवं मानव बचाव प्रेषण नेटवर्क',
    subtitle: 'Family welfare verification, missing person reports, NDRF/SDRF rescue operations, and consent-based dispatcher escalations.',
    icon: HeartHandshake,
    color: 'text-sky-600',
    badgeBg: 'bg-sky-50',
    badgeBorder: 'border-sky-300',
    badgeText: 'text-sky-800',
    stats: [
      { label: 'Welfare Checks Today', value: '4,890 Checks', sub: 'Logged via Sentinel AI Voice Agent' },
      { label: 'Family Reconnections', value: '1,420 Families', sub: 'Safely reconnected with relatives' },
      { label: 'Active Rescue Dispatches', value: '38 Teams', sub: 'NDRF & SDRF motorboat rescue squads' },
    ],
    scenarios: [
      {
        id: 'wf-1',
        location: 'Patna Sector 4 Motorboat Evacuation Operation',
        state: 'Bihar',
        status: 'RESCUE IN PROGRESS',
        statusColor: 'bg-sky-50 text-sky-900 border-sky-300',
        title: '8 Families (28 Persons) Evacuated via NDRF Motorboat',
        details: 'Welfare check-in call completed for senior citizen resident. Emergency rescue squad dispatched to waterlogged residence. All 28 family members safely relocated to Patna Central Shelter.',
        metrics: 'Rescued: 28 Persons • Ticket Ref: ESC-84291',
        action: 'Status: Safely Relocated',
      },
      {
        id: 'wf-2',
        location: 'Wayanad Plantation Safety Check-In',
        state: 'Kerala',
        status: 'SAFETY CONFIRMED',
        statusColor: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        title: '120 Tea Plantation Workers Verified Safe After Hillside Check',
        details: 'District administration conducted automated voice check-ins with 120 isolated households. Landslide risk area evacuated to Meppadi Community Hall.',
        metrics: 'Verified Safe: 120 Families • Medical Check: Passed',
        action: 'Status: Safety Logged in DB',
      },
      {
        id: 'wf-3',
        location: 'Kashmere Gate Low-Lying Family Relief',
        state: 'Delhi',
        status: 'RELIEF DISPATCHED',
        statusColor: 'bg-sky-50 text-sky-900 border-sky-300',
        title: '34 Low-Lying Families Transferred to Yamuna Relief Tents',
        details: 'Voice check-in identified 6 families with infant care needs. Emergency baby food packets, clean water bottles, and blankets dispatched via relief team.',
        metrics: 'Families Assisted: 34 • Supplies: Baby Rations Sent',
        action: 'Status: Rations Delivered',
      },
      {
        id: 'wf-4',
        location: 'Silchar Town Medical Rescue Dispatch Relay',
        state: 'Assam',
        status: 'EMERGENCY DISPATCH ACTIVE',
        statusColor: 'bg-rose-50 text-rose-800 border-rose-300',
        title: 'Urgent Medical Escalation for Expectant Mother in Waterlogged Zone',
        details: 'Caller granted explicit permission to share details with emergency dispatchers. SDRF quick-response water ambulance dispatched to Silchar Ward 7.',
        metrics: 'Ticket Ref: ESC-94821 • Unit: SDRF Water Ambulance',
        action: 'Ambulance En Route • Call 108',
      },
    ],
  },
};

export default function ServiceScenarioPage() {
  const params = useParams();
  const rawSlug = (params?.slug as string) || 'flood-alerts';
  const serviceKey = SERVICES_DATA[rawSlug] ? rawSlug : 'flood-alerts';

  const [activeTab, setActiveTab] = useState<string>(serviceKey);

  const currentService = SERVICES_DATA[activeTab] || SERVICES_DATA['flood-alerts'];
  const IconComponent = currentService.icon;

  return (
    <div className="relative min-h-screen text-slate-900 p-4 md:p-8 font-sans overflow-x-hidden selection:bg-sky-500/30">
      {/* Voice for Bharat Background Theme with Moving Ashoka Chakra */}
      <BharatBackground />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6 pt-9">
        
        {/* Top Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200/80 bg-white/70 backdrop-blur-md p-5 rounded-2xl shadow-xs">
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="p-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 transition-all shadow-xs flex items-center gap-1.5 font-mono text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Main Page</span>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base md:text-lg tracking-tight text-slate-900">
                  Sentinel<span className="text-sky-600 font-normal">Disaster Intelligence</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-300 text-[10px] font-mono font-bold text-emerald-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  LIVE INDIA DATA
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500">
                Voice for Bharat • National Disaster Management Command Feed
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="border-sky-300 bg-sky-50/90 text-sky-900 hover:bg-sky-100 font-mono text-xs shadow-xs"
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-sky-600" />
                Call Metrics
              </Button>
            </Link>
            <Link href="/escalations">
              <Button
                variant="outline"
                size="sm"
                className="border-amber-300 bg-amber-50/90 text-amber-900 hover:bg-amber-100 font-mono text-xs shadow-xs"
              >
                <Activity className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                Dispatch Dashboard
              </Button>
            </Link>
          </div>
        </header>

        {/* 4 Service Navigation Tabs */}
        <nav className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-white/80 p-2 rounded-2xl border border-slate-200/90 shadow-xs backdrop-blur-md">
          {Object.values(SERVICES_DATA).map((s) => {
            const SIcon = s.icon;
            const isActive = s.id === activeTab;
            return (
              <button
                key={s.id}
                onClick={() => setActiveTab(s.id)}
                className={`p-3 rounded-xl transition-all duration-300 flex items-center gap-3 text-left border ${
                  isActive
                    ? 'bg-white border-amber-400 shadow-md scale-[1.02]'
                    : 'bg-transparent border-transparent hover:bg-slate-100/80 text-slate-600'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg ${s.badgeBg} ${s.badgeBorder} border flex items-center justify-center ${s.color} shrink-0`}>
                  <SIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className={`text-xs font-bold truncate ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                    {s.id === 'flood-alerts' && 'Flood Alerts'}
                    {s.id === 'drought-relief' && 'Drought Relief'}
                    {s.id === 'relief-shelters' && 'Relief Shelters'}
                    {s.id === 'welfare-check' && 'Welfare Check'}
                  </div>
                  <div className="text-[10px] text-amber-600 font-sans font-medium truncate">
                    {s.id === 'flood-alerts' && 'बाढ़ चेतावनी'}
                    {s.id === 'drought-relief' && 'सूखा राहत'}
                    {s.id === 'relief-shelters' && 'राहत शिविर'}
                    {s.id === 'welfare-check' && 'सुरक्षा चेक-इन'}
                  </div>
                </div>
              </button>
            );
          })}
        </nav>

        {/* Main Service Scenario Section */}
        <main className="space-y-6">
          
          {/* Header Title Card */}
          <div className="p-6 md:p-8 rounded-3xl bg-white/90 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3.5">
                <div className={`w-12 h-12 rounded-2xl ${currentService.badgeBg} ${currentService.badgeBorder} border flex items-center justify-center ${currentService.color} shadow-sm shrink-0`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                    {currentService.title}
                  </h1>
                  <p className="text-xs md:text-sm font-bold text-amber-600 font-sans mt-0.5">
                    {currentService.hindiTitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-300 font-bold shrink-0 self-start md:self-auto">
                <Radio className="w-3.5 h-3.5 text-emerald-600 animate-ping" />
                <span>REAL-TIME SCENARIO FEED</span>
              </div>
            </div>

            <p className="text-slate-600 text-xs md:text-sm leading-relaxed font-normal">
              {currentService.subtitle}
            </p>

            {/* 3 Key Stats Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {currentService.stats.map((st, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-1">
                  <span className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                    {st.label}
                  </span>
                  <span className="text-2xl font-black text-slate-900 font-mono block">
                    {st.value}
                  </span>
                  <span className="text-[11px] text-slate-600 font-medium block">
                    {st.sub}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Active India Scenarios Grid / List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>Current Scenario & Regional Telemetry in India</span>
              </h2>
              <span className="text-xs font-mono text-slate-500">
                Showing {currentService.scenarios.length} active regional reports
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {currentService.scenarios.map((sc) => (
                <div
                  key={sc.id}
                  className="p-5 md:p-6 rounded-2xl bg-white/95 border border-slate-200/90 shadow-sm hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold border bg-slate-100 text-slate-800 border-slate-300">
                        📍 {sc.location} ({sc.state})
                      </span>
                    </div>

                    <span className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold border ${sc.statusColor} self-start sm:self-auto`}>
                      {sc.status}
                    </span>
                  </div>

                  <h3 className="text-sm md:text-base font-extrabold text-slate-900 tracking-tight">
                    {sc.title}
                  </h3>

                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-normal">
                    {sc.details}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                    <span className="text-sky-700 font-bold bg-sky-50 px-3 py-1 rounded-lg border border-sky-200">
                      📊 {sc.metrics}
                    </span>
                    <span className="text-emerald-800 font-bold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {sc.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Call CTA Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500 via-teal-600 to-sky-600 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                Need Live Disaster Assistance for Your District?
              </h3>
              <p className="text-xs sm:text-sm font-sans opacity-95">
                आपदा सहायता के लिए सीधेSentinel AI एजेंट से बात करें • Hands-free voice active
              </p>
            </div>
            <Link href="/">
              <Button
                size="lg"
                className="rounded-full bg-white text-slate-900 hover:bg-slate-100 font-mono text-xs font-extrabold px-6 py-3 shadow-md shrink-0 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4 mr-2 text-emerald-600 animate-bounce" />
                <span>START EMERGENCY CALL</span>
              </Button>
            </Link>
          </div>

        </main>

        {/* Footer */}
        <footer className="w-full pt-4 pb-2 border-t border-slate-200/80 text-xs font-mono text-slate-500 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Voice for Bharat • National Disaster Management Command System</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Main Page
            </Link>
            <span className="text-slate-300">•</span>
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
    </div>
  );
}
