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

**Sentinel** is an emergency Disaster Response Voice AI Assistant operating on behalf of the National Emergency Management & Disaster Relief Command under the **Voice for Bharat** theme. Built with LiveKit Agents, Murf Falcon TTS, Deepgram Nova-3 Multilingual STT, and Google Gemini LLM, Sentinel provides real-time disaster alerts, spatial shelter navigation with capacity tracking, persistent caller memory, human rescue escalation, sensitive PII redaction, request status tracking, and automated resolution callbacks.

---

## 🌟 Key Features

- **🇮🇳 Voice for Bharat Emergency Theme**: Saffron, white, and emerald ambient glows with 24-spoke Ashoka Chakra watermark, top emergency helplines (`112 | 1078 | 108`), and SSR hydration safety.
- **📱 Side-by-Side Split-Screen Session**: Agent Robot Console on Left 50% column and Real-Time Live Conversation Log (`LIVE CONVERSATION LOG`) on Right 50% column with zero text overlaps.
- **🗣️ All-Indian Native Languages Support**: Deepgram `language="multi"` STT with automatic script detection (Hindi/Devanagari, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, Urdu, and English) and dynamic LLM native language responses.
- **🔒 Persistent Caller Memory & Direct Recognition**: Automatic SQLite returning caller lookup. Once caller name and location are saved with explicit privacy consent (`permission_granted=True`), Sentinel AI **never** asks for name or location again, immediately addressing them by name and confirming saved location.
- **🚨 Human Help Escalation Tool (`create_escalation`)**: Automatically triggers when callers report being trapped, injured, or needing urgent physical rescue.
- **🛡️ Strict Two-Turn Verbal Consent Flow (Step 4)**: Sentinel NEVER sends user information without first stating what will be sent and asking for explicit verbal permission out loud. If the caller denies permission, no ticket is created and emergency hotline 112 is provided.
- **🔒 Sensitive PII Redaction (`sanitize_summary`)**: Automatically sanitizes private sensitive details (phone numbers, email addresses, national IDs / Aadhaar / SSNs, credit card numbers, passwords/PINs) before storage or dispatcher notification.
- **🔁 Duplicate Request Prevention & Urgency Elevation**: Automatically updates open tickets for returning callers/locations instead of creating duplicates, and elevates urgency level (`LOW`, `MEDIUM`, `HIGH`, `EMERGENCY`) if condition worsens.
- **📋 Live Emergency Dispatcher Dashboard & Webhooks (Step 5)**: Real-time Next.js Dashboard (`/escalations`) and API route (`/api/escalations`) displaying open requests, urgency badges, sanitized summaries, and dispatch action controls. Supports HTTP POST webhooks to Discord, Slack, or custom APIs.
- **🏷️ Clear Reference IDs & Next Steps (Step 6)**: Returns a unique Reference ID (e.g. `ESC-62352`), explains next steps, and tracks dispatch status without making false immediate arrival promises.
- **📞 Outbound Resolution Callbacks**: Automatically places an automated LiveKit SIP outbound call to inform callers when their request status is updated to `RESOLVED`.
- **🏢 Specialized Multi-Agent Handoff System (`ShelterInformationSpecialist`)**: Dedicated expert agent for disaster relief shelter queries, real-time available capacity, facilities, pet policies, medical care facilities, check-in rules, and spatial directions.
- **🔄 Dynamic Context-Preserving Agent Handoff (`transfer_to_shelter_specialist` & `transfer_to_main_agent`)**: Context-aware handoff tools using LiveKit `session.update_agent()` for seamless bidirectional switching between Sentinel Main Command and Shelter Specialist while preserving caller context and conversation history.
- **🗣️ Immediate Out-Loud Takeover Speech Engine**: Upon handoff, the Shelter Specialist instantly synthesizes and speaks live shelter status and available bed details directly to the user over Murf TTS via `context.session.say()`.
- **🏷️ Dynamic Frontend UI Avatar Handoff Switching**: Real-time DataPacket payload (`AGENT_HANDOFF`) sent to frontend, triggering instant visual avatar card switching (Sentinel Robot card $\leftrightarrow$ Shelter Specialist green badge card) on the browser console (`tile-view.tsx` & `view-controller.tsx`).
- **🧹 Caller Memory Deletion (`forget_caller`)**: Secure caller memory wipe tool allowing callers to permanently delete their stored records and PII from the SQLite database upon request.

---

## 🏗️ Architecture & Pipeline

```
┌──────────────┐     ┌───────────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User Audio  │ ──> │   Deepgram STT    │ ──> │  Gemini LLM  │ ──> │ Murf Falcon  │ ──> │ User Hears   │
│  Input (RTC) │     │ (Nova-3 Multi)   │     │ Function Call│     │ TTS Audio    │     │ Response     │
└──────────────┘     └───────────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                       │
                                                       ▼
                                           ┌─────────────────────────────┐
                                           │   Disaster Data & DB        │
                                           │  • Open-Meteo Flood         │
                                           │  • Open-Meteo Weather       │
                                           │  • Shelter Haversine        │
                                           │  • SQLite Persistence       │
                                           │  • PII Redaction & Dedupe   │
                                           │  • Dispatch Web Dashboard   │
                                           │  • Outbound Callback Engine │
                                           └─────────────────────────────┘
```

---

## 🛠️ Function Tools API

| Function Tool | Purpose | Real Data Source / Computation | Timeout & Out-Loud Fallback Path |
|---|---|---|---|
| `create_escalation` | Create/update human rescue escalation ticket | SQLite `escalation_requests` table + PII Redaction Engine + Webhook | Enforces explicit consent & deduplication; returns Reference ID `ESC-XXXXX` |
| `check_escalation_status` | Check request status (`OPEN`, `IN_PROGRESS`, `RESOLVED`) | SQLite `escalation_requests` lookup | Returns current status and resolution notes |
| `resolve_escalation` | Mark ticket resolved & trigger callback | SQLite status update + LiveKit SIP dispatch | Automatically triggers outbound resolution call to caller |
| `get_disaster_alerts` | District flood & severe weather status | Open-Meteo Geocoding, Forecast, & Flood APIs ($m^3/s$ discharge, precip, wind) | 3.0s timeout $\to$ Out-loud offline emergency alert with timestamp |
| `find_relief_centers` | Nearest shelter lookup & bed capacity | Structured shelter dataset + Haversine spatial distance math ($d = 2R \arcsin(\dots)$) | 3.0s timeout $\to$ Out-loud offline shelter directory with capacity & facilities |
| `lookup_caller` | Memory check for returning callers | SQLite `callers` database table | Returns caller facts & last check-in |
| `save_caller_data` | Store caller facts & location | SQLite `callers` database table | Strict explicit consent check (`permission_granted=True`) |
| `forget_caller` | Permanent data wipe | SQLite deletion | Permanent record removal from database |

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

- **Framework**: [LiveKit Agents SDK (Python)](https://github.com/livekit/agents) & Next.js Frontend
- **Speech-to-Text (STT)**: Deepgram Nova-3 Multilingual (`nova-3`, `language="multi"`)
- **Large Language Model (LLM)**: Google Gemini 3.5 Flash (`gemini-3.5-flash-lite`)
- **Text-to-Speech (TTS)**: Murf Falcon Streaming TTS (`voice="Anisha"`, `locale="hi-IN"`)
- **Voice Activity Detection (VAD)**: Silero VAD
- **Turn Detection**: LiveKit Multilingual Turn Detector
- **Domain APIs**: Open-Meteo Flood API, Weather Forecast API, Geocoding API
- **Persistence & Dashboard**: SQLite 3 & Next.js Emergency Dispatcher Dashboard

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

### 3. Run the Frontend App & Dashboard

```bash
cd frontend
pnpm dev
```

- Voice Assistant App: `http://localhost:3000`
- Emergency Dispatcher Dashboard: `http://localhost:3000/escalations`

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

### Test Coverage Summary

- `tests/test_both_paths.py`: Integration test verifying normal conversation path vs. emergency human escalation path with consent vs. permission refusal.
- `tests/test_day7_escalation.py`: Tests human escalation tickets, urgency classification (`LOW`, `MEDIUM`, `HIGH`, `EMERGENCY`), PII redaction, deduplication, and resolution callbacks.
- `tests/test_disaster_tools.py`: Tests live Open-Meteo data fetching, spatial distance math, capacity calculations, explicit timestamping, and out-loud timeout error handling.
- `tests/test_db.py`: Tests caller SQLite persistence, explicit privacy consent enforcement, returning caller lookups, and data wiping.
- `tests/test_agent.py`: LLM-as-judge evaluations verifying agent friendliness, grounding, and harmful request refusals.

```text
collected 24 items

scratch/test_handoff_behavior.py .                                       [  4%]
src/test_db.py .....                                                     [ 25%]
tests/test_agent.py ...                                                  [ 37%]
tests/test_day7_escalation.py ..                                         [ 45%]
tests/test_db.py .....                                                   [ 66%]
tests/test_disaster_tools.py .......                                     [ 95%]
tests/test_shelter_specialist_handoff.py .                               [100%]

============================= 24 passed in 40.27s =============================
```

---

## 📁 Project Structure

```
murf-livekit-starter/
├── backend/
│   ├── caller_data.db        # SQLite database for persistent caller profiles & escalation tickets
│   ├── scratch/
│   │   └── test_handoff_behavior.py # Agent session handoff verification script
│   ├── src/
│   │   ├── agent.py          # Sentinel Agent & Shelter Specialist entrypoint, escalation tools & session runner
│   │   ├── db.py             # SQLite caller persistence, escalation ticket manager & PII redactor
│   │   ├── disaster_data.py  # Open-Meteo API integrations, Haversine math, & out-loud error handler
│   │   ├── outbound_call.py  # Outbound emergency dispatch & resolution callback script
│   │   └── prompt.py         # System prompt, Sentinel & Specialist identities, consent rules & mandates
│   └── tests/
│       ├── test_agent.py                  # LLM-as-judge evaluation suite
│       ├── test_both_paths.py             # Dual-path verification (Normal vs. Escalation path)
│       ├── test_day7_escalation.py         # Escalation ticket, PII & callback unit tests
│       ├── test_db.py                     # Database & permission unit tests
│       ├── test_disaster_tools.py         # Disaster tools & network failure unit tests
│       ├── test_full_handoff_say.py       # Specialist out-loud TTS speech takeover test
│       ├── test_gemini.py                 # Google Gemini LLM model integration test
│       ├── test_murf_tts.py               # Murf Falcon TTS streaming test
│       └── test_shelter_specialist_handoff.py # Multi-Agent Shelter Specialist handoff unit tests
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # Main Voice Assistant page
│   │   ├── escalations/page.tsx   # Live Emergency Dispatcher Dashboard
│   │   └── api/
│   │       ├── token/route.ts        # LiveKit token endpoint
│   │       └── escalations/route.ts  # Emergency escalation DB query & resolution API
│   └── components/
│       ├── app/                   # WelcomeView, BharatBackground, DisasterTicker
│       └── agents-ui/             # Side-by-side AgentSessionBlock & Live Conversation Log
├── pyproject.toml            # Python package dependencies (uv)
└── README.md                 # Project documentation
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
