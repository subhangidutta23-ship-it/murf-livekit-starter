<a href="https://livekit.io/">
  <img src="https://raw.githubusercontent.com/livekit/agents/main/docs/assets/livekit-agents-header.png" alt="Sentinel Voice AI Banner" width="100%" />
</a>

# 🚨 Sentinel — Emergency Disaster Response Voice AI Agent (Voice for Bharat)

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge&logo=github)](https://github.com/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![LiveKit](https://img.shields.io/badge/LiveKit-Agents-000000?style=for-the-badge&logo=livekit)](https://livekit.io)
[![Murf AI](https://img.shields.io/badge/Murf_TTS-Falcon_Stream-0055FF?style=for-the-badge)](https://murf.ai)
[![Gemini](https://img.shields.io/badge/Google-Gemini_3.5_Flash-8E75FF?style=for-the-badge&logo=google)](https://aistudio.google.com)
[![Deepgram](https://img.shields.io/badge/Deepgram-Nova--3_Multilingual-13EF95?style=for-the-badge)](https://deepgram.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**Sentinel** is an emergency Disaster Response Voice AI Assistant operating on behalf of the National Emergency Management & Disaster Relief Command under the **Voice for Bharat** theme. Built with LiveKit Agents, Murf Falcon TTS, Deepgram Nova-3 Multilingual STT, and Google Gemini LLM, Sentinel provides real-time disaster alerts, spatial shelter navigation with bed capacity tracking, persistent caller memory, human rescue escalation, sensitive PII redaction, dispatcher dashboard webhooks, automated resolution callbacks, call recording metrics analytics with circular SVG gauge displays, and regional disaster scenario intelligence.

---

## 🌟 Key Features

### 🇮🇳 Core Voice Agent & Regional Intelligence
- **🇮🇳 Voice for Bharat Emergency Theme**: Saffron, white, and emerald ambient glows with 24-spoke Ashoka Chakra watermark, top emergency helplines (`112 | 1078 | 108`), and SSR hydration safety.
- **📱 Side-by-Side Split-Screen Session**: Agent Robot Console on Left 50% column and Real-Time Live Conversation Log (`LIVE CONVERSATION LOG`) on Right 50% column with zero text overlaps.
- **🗣️ All-Indian Native Languages Support**: Deepgram `language="multi"` STT with automatic script detection (Hindi/Devanagari, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu, and English) and dynamic LLM native language responses.
- **🔒 Persistent Caller Memory & Direct Recognition**: Automatic SQLite returning caller lookup. Once caller name and location are saved with explicit privacy consent (`permission_granted=True`), Sentinel AI **never** asks for name or location again, immediately addressing them by name and confirming saved location.
- **🌊 Real-Time District Flood & Weather Alerts**: Live river discharge monitoring ($m^3/s$), precipitation rates, and severe weather advisories powered by Open-Meteo Flood & Weather APIs.
- **🏥 Spatial Emergency Shelter Search**: Nearest shelter distance computation using the Haversine formula, total bed capacity, occupancy tracking, and real-time available capacity calculation.
- **📢 Out-Loud Network Failure Resilience**: Strict 3.0-second network timeout protection. Spoken fallback alerts with cached offline emergency protocols during degraded connectivity or offline status.
- **🕒 Explicit Data Timestamping & Number Formatting**: Spoken English date & time observation timestamps and automatic numeric-to-word conversion (`2.1` $\to$ `two point one`) for natural speech output.

---

### 🚨 Day 7 — Human Rescue Escalation & Webhook System
- **🚨 Human Help Escalation Tool (`create_escalation`)**: Automatically triggers when callers report being trapped, injured, or needing urgent physical rescue.
- **🛡️ Strict Two-Turn Verbal Consent Flow**: Sentinel NEVER sends user information without first stating what will be sent and asking for explicit verbal permission out loud (`permission_granted=True`).
- **🔒 Sensitive PII Redaction (`sanitize_summary`)**: Automatically sanitizes private sensitive details (phone numbers, email addresses, national IDs / Aadhaar / SSNs, credit card numbers, passwords/PINs) before storage or dispatcher notification.
- **🔁 Duplicate Request Prevention & Urgency Elevation**: Automatically updates open tickets for returning callers/locations instead of creating duplicates, and elevates urgency level (`LOW`, `MEDIUM`, `HIGH`, `EMERGENCY`) if condition worsens.
- **📋 Live Emergency Dispatcher Dashboard & Webhooks (`/escalations`)**: Real-time Next.js Dashboard displaying open requests, urgency badges, sanitized summaries, and dispatch action controls. Supports HTTP POST webhooks to Discord, Slack, or custom APIs.
- **📞 Outbound Resolution Callbacks**: Automatically places an automated LiveKit SIP outbound call to inform callers when their request status is updated to `RESOLVED`.

---

### 📊 Day 8 — Call Session Analytics & Disaster Intelligence Portal
- **📊 Real-Time Call Session Recording & Metrics Dashboard (`/dashboard`)**:
  - **Circular SVG Success Rate Gauge**: Dynamic green progress arc reflecting call success percentage against a red base track indicator for failed calls.
  - **Core KPI Cards**: Total Calls, Successful Calls (verified info provided or ticket created), Failed Calls (early drop-offs), and Success Rate %.
  - **Detailed Call Log Table**: Real-time logs displaying Call ID, Caller Name, Call Type badge (`Browser WebRTC` vs `SIP Phone`), Status Indicator (`SUCCESS` / `FAILED`), Outcome Reason, and Call Duration.
  - **Optimized Python Bridge (`db_cli.py`) & Caching**: Server-side in-memory cache (`CACHE_TTL_MS = 2000`) in `/api/dashboard` preventing event-loop freezing during high-frequency polling.
- **🗺️ National Emergency Disaster Services Portal (`/services/[slug]`)**:
  - **4 Live Disaster Scenario Domains**: Flood Telemetry, Drought Relief, Relief Shelter Directory, and Welfare Check-Ins.
  - **Regional Hazard Coverage**: Real-time situation reports for Bihar/Patna, Yamuna/Delhi, Wayanad/Kerala, Silchar/Assam, Konkan/Mumbai, Marathwada, Bundelkhand, and Vidarbha.
  - **Instant Navigation Bar**: Integrated navigation header linking main emergency agent console, Call Metrics Dashboard, and Disaster Scenario Intelligence feeds.

---

## 🏗️ Architecture & Pipeline

```
┌──────────────┐     ┌───────────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User Audio  │ ──> │   Deepgram STT    │ ──> │  Gemini LLM  │ ──> │ Murf Falcon  │ ──> │ User Hears   │
│  Input (RTC) │     │ (Nova-3 Multi)   │     │ Function Call│     │ TTS Audio    │     │ Response     │
└──────────────┘     └───────────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                       │
                                                       ▼
                               ┌───────────────────────────────────────────────┐
                               │             Disaster Engine & DB              │
                               │  • Open-Meteo Flood & Weather APIs            │
                               │  • Spatial Haversine Shelter Math             │
                               │  • SQLite Persistence (Caller & Tickets)      │
                               │  • Sensitive PII Scrubbing & Deduplication    │
                               │  • Dispatcher Dashboard & Webhooks            │
                               │  • Outbound LiveKit SIP Resolution Callbacks  │
                               │  • SQLite Call Recording & Performance Engine │
                               │  • Next.js Analytics Dashboard (/dashboard)   │
                               │  • National Disaster Portal (/services)       │
                               └───────────────────────────────────────────────┘
```

---

## 🛠️ Function Tools & Database APIs

| API / Tool | Type | Purpose | Key Logic / Output |
|---|---|---|---|
| `create_escalation` | Agent Tool | Create/update human rescue escalation ticket | Enforces explicit consent & PII scrubbing; returns Reference ID `ESC-XXXXX` |
| `check_escalation_status` | Agent Tool | Check request status (`OPEN`, `IN_PROGRESS`, `RESOLVED`) | Queries SQLite ticket database and returns resolution status & notes |
| `resolve_escalation` | Dispatcher API | Mark ticket resolved & trigger callback | Updates SQLite ticket status and places automated LiveKit SIP outbound call |
| `save_call_record` | DB Engine | Save completed call session outcome & duration | Logs `call_id`, `caller_name`, `call_type`, `status`, `outcome_reason`, and `duration_seconds` |
| `get_call_metrics` | DB Engine | Compute call statistics for analytics dashboard | Calculates `total_calls`, `successful_calls`, `failed_calls`, and `success_rate` % |
| `list_call_records` | DB Engine | Retrieve recent call logs for analytics dashboard | Returns structured list of recent call records |
| `get_disaster_alerts` | Agent Tool | District flood & severe weather status | Fetches Open-Meteo live discharge ($m^3/s$), rainfall, and wind data |
| `find_relief_centers` | Agent Tool | Nearest shelter lookup & bed capacity | Haversine distance calculation ($d = 2R \arcsin(\dots)$) + capacity tracking |
| `lookup_caller` | Agent Tool | Returning caller memory lookup | SQLite caller lookup returning facts & previous location |
| `save_caller_data` | Agent Tool | Store caller profile & location | Strict consent check (`permission_granted=True`) |
| `forget_caller` | Agent Tool | Permanent caller profile removal | Deletes caller record from SQLite database |

---

## ⚠️ Safety & Design Rules

> [!IMPORTANT]
> **Strict Consent Privacy Rule**: Sentinel NEVER saves personal caller information or creates human escalation tickets without asking for explicit verbal permission out loud and getting positive caller consent (`permission_granted=True`).

> [!IMPORTANT]
> **PII Redaction Mandate**: All escalation summaries automatically undergo regex PII scrubbing (phone numbers, emails, national IDs / Aadhaar / SSNs, card numbers, PINs) before database storage or dispatcher notification.

> [!IMPORTANT]
> **Returning Caller Memory Mandate**: Once a caller's name and location are saved in the database, Sentinel NEVER asks for name or location again. It directly greets them by name and confirms their saved location.

> [!WARNING]
> **Out-Loud Failure Resilience**: During severe storm conditions or network timeouts (3-second limit), Sentinel speaks an offline emergency fallback status out loud instead of going silent or hallucinating live numbers.

> [!NOTE]
> **Number Spoken Form Rule**: All numeric values in tool outputs are converted to English words (e.g. `2.1` $\to$ `two point one`) so the TTS voice engine speaks naturally without reading raw digits.

---

## 💻 Tech Stack

- **Framework**: [LiveKit Agents SDK (Python)](https://github.com/livekit/agents) & Next.js 15 Frontend
- **Speech-to-Text (STT)**: Deepgram Nova-3 Multilingual (`nova-3`, `language="multi"`)
- **Large Language Model (LLM)**: Google Gemini 3.5 Flash (`gemini-3.5-flash-lite`)
- **Text-to-Speech (TTS)**: Murf Falcon Streaming TTS (`voice="Anisha"`, `locale="hi-IN"`)
- **Voice Activity Detection (VAD)**: Silero VAD
- **Turn Detection**: LiveKit Multilingual Turn Detector
- **Domain APIs**: Open-Meteo Flood API, Weather Forecast API, Geocoding API
- **Persistence & DB Bridge**: SQLite 3 & `db_cli.py` Python bridge
- **Dashboards**:
  - Live Emergency Dispatcher Dashboard (`/escalations`)
  - Real-Time Call Performance & Metrics Analytics Dashboard (`/dashboard`)
  - Disaster Intelligence Services Portal (`/services/[slug]`)

---

## 🚀 Dev Setup & Quickstart

### 1. Prerequisites & Environment Setup

Clone the repository and install backend dependencies using `uv`:

```bash
cd backend
uv sync
```

Configure your API credentials by creating a `.env.local` file:

```bash
cp .env.example .env.local
```

Fill in your environment variables in `.env.local`:

```env
LIVEKIT_URL=wss://your-livekit-project.livekit.cloud
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
MURF_API_KEY=your_murf_api_key
DEEPGRAM_API_KEY=your_deepgram_api_key
GOOGLE_API_KEY=your_google_gemini_api_key
WEBHOOK_URL=https://discord.com/api/webhooks/your-webhook-url
```

### 2. Run the Agent Server

```bash
uv run python src/agent.py dev
```

### 3. Run the Frontend App & Web Portals

```bash
cd frontend
pnpm dev
```

- **Voice Assistant Console**: `http://localhost:3000`
- **Emergency Dispatcher Dashboard**: `http://localhost:3000/escalations`
- **Call Session Analytics Dashboard**: `http://localhost:3000/dashboard`
- **Disaster Intelligence Services Portal**: `http://localhost:3000/services/flood-alerts`

### 4. Trigger Outbound Emergency Calls (Optional)

You can dispatch automated emergency outbound calls using:

```bash
uv run python src/outbound_call.py
```

---

## 🧪 Testing & Evaluation Suite

Sentinel includes a full unit test and evaluation suite built on `pytest` and LiveKit Agents testing framework:

```bash
uv run pytest
```

### Additional Test Verification Scripts

```bash
# Verify dual-path execution (Normal conversation vs Human escalation path)
uv run python tests/test_both_paths.py

# Verify Step 5 call recording, duration tracking & analytics metrics DB
uv run python src/test_call_recording.py
```

### Test Coverage Summary

- `src/test_call_recording.py`: Verification of call session recording, status classification (`SUCCESS` / `FAILED`), duration logging, and metrics computation.
- `tests/test_both_paths.py`: Integration test verifying normal conversation path vs. emergency human escalation path with consent vs. permission refusal.
- `tests/test_day7_escalation.py`: Tests human escalation tickets, urgency classification (`LOW`, `MEDIUM`, `HIGH`, `EMERGENCY`), PII redaction, deduplication, and resolution callbacks.
- `tests/test_disaster_tools.py`: Tests live Open-Meteo data fetching, spatial distance math, capacity calculations, explicit timestamping, and out-loud timeout error handling.
- `tests/test_db.py`: Tests caller SQLite persistence, explicit privacy consent enforcement, returning caller lookups, and data wiping.
- `tests/test_agent.py`: LLM-as-judge evaluations verifying agent friendliness, grounding, and harmful request refusals.

```text
collected 17 items

tests/test_agent.py ...                                                 [ 17%]
tests/test_day7_escalation.py ..                                        [ 29%]
tests/test_db.py .....                                                  [ 58%]
tests/test_disaster_tools.py .......                                    [100%]

============================= 17 passed in 19.3s =============================
```

---

## 📁 Project Structure

```
murf-livekit-starter/
├── backend/
│   ├── caller_data.db        # SQLite database for persistent caller profiles, escalation tickets & call records
│   ├── src/
│   │   ├── agent.py          # Sentinel Agent entrypoint, escalation tools & LiveKit session runner
│   │   ├── db.py             # SQLite persistence, caller profiles, escalation tickets, call recording & metrics
│   │   ├── db_cli.py         # Command-line JSON interface bridge for Next.js API routes
│   │   ├── disaster_data.py  # Open-Meteo API integrations, Haversine math, & out-loud error handler
│   │   ├── outbound_call.py  # Outbound emergency dispatch & resolution callback script
│   │   ├── prompt.py         # System prompt, Sentinel identity, consent rules & escalation mandates
│   │   └── test_call_recording.py # Call recording & metrics verification script
│   └── tests/
│       ├── test_agent.py          # LLM-as-judge evaluation suite
│       ├── test_both_paths.py     # Dual-path verification (Normal vs. Escalation path)
│       ├── test_day7_escalation.py # Escalation ticket, PII & callback unit tests
│       ├── test_db.py             # Database & permission unit tests
│       └── test_disaster_tools.py # Disaster tools & network failure unit tests
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # Main Voice Assistant page
│   │   ├── escalations/page.tsx   # Live Emergency Dispatcher Dashboard
│   │   ├── dashboard/page.tsx     # Real-Time Call Session Analytics Dashboard
│   │   ├── services/[slug]/page.tsx # National Emergency Disaster Services Portal
│   │   └── api/
│   │       ├── token/route.ts        # LiveKit token endpoint
│   │       ├── escalations/route.ts  # Emergency escalation DB query & resolution API
│   │       └── dashboard/route.ts    # Call performance metrics & session log API
│   └── components/
│       ├── app/                   # WelcomeView, BharatBackground, DisasterAvatar
│       └── agents-ui/             # Side-by-side AgentSessionBlock & Live Conversation Log
├── pyproject.toml            # Python package dependencies (uv)
└── README.md                 # Project documentation
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
