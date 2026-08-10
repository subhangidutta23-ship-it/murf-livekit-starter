<a href="https://livekit.io/">
  <img src="https://raw.githubusercontent.com/livekit/agents/main/docs/assets/livekit-agents-header.png" alt="Sentinel Voice AI Banner" width="100%" />
</a>

# 🚨 Sentinel — Emergency Disaster Response Voice AI Agent

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge&logo=github)](https://github.com/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![LiveKit](https://img.shields.io/badge/LiveKit-Agents-000000?style=for-the-badge&logo=livekit)](https://livekit.io)
[![Murf AI](https://img.shields.io/badge/Murf_TTS-Falcon_Stream-0055FF?style=for-the-badge)](https://murf.ai)
[![Gemini](https://img.shields.io/badge/Google-Gemini_3.5_Flash-8E75FF?style=for-the-badge&logo=google)](https://aistudio.google.com)
[![Deepgram](https://img.shields.io/badge/Deepgram-Nova--3-13EF95?style=for-the-badge)](https://deepgram.com)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

**Sentinel** is an emergency Disaster Response Voice AI Assistant operating on behalf of the National Emergency Management & Disaster Relief Command. Built with LiveKit Agents, Murf Falcon TTS, Deepgram Nova-3 STT, and Google Gemini LLM, Sentinel provides real-time disaster alerts, spatial shelter navigation with capacity tracking, function-based memory persistence with explicit privacy consent, and out-loud network failure resilience.

---

## 🌟 Key Features

- **🌊 Real-Time District Flood & Weather Alerts**: Live river discharge monitoring ($m^3/s$), precipitation rates, and severe weather advisories powered by Open-Meteo Flood & Weather APIs.
- **🏥 Spatial Emergency Shelter Search**: Nearest shelter distance computation using the Haversine formula, total bed capacity, occupancy tracking, and real-time available capacity calculation.
- **📢 Out-Loud Network Failure Resilience**: Strict 3.0-second network timeout protection. Spoken fallback alerts with cached offline emergency protocols during degraded connectivity.
- **🕒 Explicit Data Timestamping**: Every alert and shelter status update states exact observation date & time in spoken English words so callers know data freshness.
- **💾 Function-Based Memory & Explicit Privacy Consent**: SQLite caller persistence that checks caller memory upon user consent and strictly adheres to privacy rights.
- **🗣️ Spoken Number Formatting**: Automatically converts numeric outputs into spoken words (e.g. `2.1` $\to$ `two point one`, `500` $\to$ `five hundred`) for smooth text-to-speech audio streaming.
- **🌐 Multilingual Voice Intelligence**: Seamless English & Hindi support with live language detection, sentence tokenization, and natural tone switching.

---

## 🏗️ Architecture & Pipeline

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User Audio  │ ──> │ Deepgram STT │ ──> │  Gemini LLM  │ ──> │ Murf Falcon  │ ──> │ User Hears   │
│  Input (RTC) │     │ (Nova-3)     │     │ Function Call│     │ TTS Audio    │     │ Response     │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                     ┌───────────────────────┐
                                     │   Disaster Data & DB  │
                                     │  • Open-Meteo Flood   │
                                     │  • Open-Meteo Weather │
                                     │  • Shelter Haversine  │
                                     │  • SQLite Persistence │
                                     └───────────────────────┘
```

---

## 🛠️ Function Tools API

| Function Tool | Purpose | Real Data Source / Computation | Timeout & Out-Loud Fallback Path |
|---|---|---|---|
| `get_disaster_alerts` | District flood & severe weather status | Open-Meteo Geocoding, Forecast, & Flood APIs ($m^3/s$ discharge, precip, wind) | 3.0s timeout $\to$ Out-loud offline emergency alert with timestamp |
| `find_relief_centers` | Nearest shelter lookup & bed capacity | Structured shelter dataset + Haversine spatial distance math ($d = 2R \arcsin(\dots)$) | 3.0s timeout $\to$ Out-loud offline shelter directory with capacity & facilities |
| `lookup_caller` | Memory check for returning callers | SQLite `callers` database table | Returns caller facts & last check-in |
| `save_caller_data` | Store caller facts & location | SQLite `callers` database table | Strict explicit consent check (`permission_granted=True`) |
| `forget_caller` | Permanent data wipe | SQLite deletion | Permanent record removal from database |
| `perform_welfare_check_in` | Log safety check-in | SQLite caller record update | Logs safety status & location |

---

## ⚠️ Safety & Design Rules

> [!IMPORTANT]
> **Strict Consent Privacy Rule**: Sentinel NEVER saves personal caller information (name, location, household size) without asking for explicit permission and getting positive caller consent (`permission_granted=True`).

> [!WARNING]
> **Out-Loud Failure Resilience**: During severe storm conditions or network timeouts (3-second limit), Sentinel speaks an offline emergency fallback status out loud instead of going silent or hallucinating live numbers.

> [!NOTE]
> **Number Spoken Form Rule**: All numeric values in tool outputs are converted to English words (e.g. `2.1` $\to$ `two point one`) so the TTS voice engine speaks naturally without reading awkward digit sequences.

---

## 💻 Tech Stack

- **Framework**: [LiveKit Agents SDK (Python)](https://github.com/livekit/agents)
- **Speech-to-Text (STT)**: Deepgram Nova-3 (`nova-3`)
- **Large Language Model (LLM)**: Google Gemini 3.5 Flash (`gemini-3.5-flash-lite`)
- **Text-to-Speech (TTS)**: Murf Falcon Streaming TTS (`voice="Anisha"`, `locale="hi-IN"`)
- **Voice Activity Detection (VAD)**: Silero VAD
- **Turn Detection**: LiveKit Multilingual Turn Detector
- **Domain APIs**: Open-Meteo Flood API, Weather Forecast API, Geocoding API
- **Persistence Store**: SQLite 3

---

## 🚀 Dev Setup & Quickstart

### 1. Prerequisites & Environment Setup

Clone the repository and install dependencies using `uv`:

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
```

### 2. Download Machine Learning Models

Download Silero VAD and LiveKit turn detection models:

```bash
uv run python src/agent.py download-files
```

### 3. Run the Agent

**Interactive Console Mode (Speak directly in terminal):**
```bash
uv run python src/agent.py console
```

**Development Mode (Auto-reload for frontend integration):**
```bash
uv run python src/agent.py dev
```

**Production Mode:**
```bash
uv run python src/agent.py start
```

---

## 🧪 Testing & Evaluation Suite

Sentinel includes a full unit test and evaluation suite built on `pytest` and LiveKit Agents testing framework:

```bash
uv run pytest
```

### Test Coverage Summary

- `tests/test_disaster_tools.py`: Tests live Open-Meteo data fetching, spatial distance math, capacity calculations, explicit timestamping, and out-loud timeout error handling.
- `tests/test_db.py`: Tests caller SQLite persistence, explicit privacy consent enforcement, returning caller lookups, and data wiping.
- `tests/test_agent.py`: LLM-as-judge evaluations verifying agent friendliness, grounding, and harmful request refusals.

```
collected 15 items

tests/test_agent.py ...                                                 [ 20%]
tests/test_db.py .....                                                  [ 53%]
tests/test_disaster_tools.py .......                                    [100%]

============================= 15 passed in 40.2s =============================
```

---

## 📁 Project Structure

```
my-agent/
├── src/
│   ├── agent.py          # Sentinel Agent entrypoint, system prompt, and function tools
│   ├── db.py             # SQLite caller persistence and privacy consent manager
│   ├── disaster_data.py  # Open-Meteo API integrations, Haversine math, & out-loud error handler
│   └── prompt.py         # System prompt and multilingual instructions
├── tests/
│   ├── test_agent.py     # LLM-as-judge evaluation suite
│   ├── test_db.py        # Database & permission unit tests
│   └── test_disaster_tools.py # Disaster tools & network failure unit tests
├── .env.example           # Environment variables template
├── pyproject.toml         # Python package dependencies (uv)
├── Dockerfile             # Production Docker container
└── README.md              # Project documentation
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
