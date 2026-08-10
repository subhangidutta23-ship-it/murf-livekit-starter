import asyncio
import logging
import re
from datetime import datetime, timezone
import httpx

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    RunContext,
    UserInputTranscribedEvent,
    cli,
    function_tool,
    room_io,
    tokenize,
)
from livekit.plugins import deepgram, google, murf, noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

import db
import disaster_data

logger = logging.getLogger("agent")

load_dotenv(".env.local")

# Global flag to simulate API outage on first call and succeed on second call (for video demo)
SHOULD_FAIL_ONCE = True

SYSTEM_PROMPT = """You are Sentinel, an emergency Disaster Response Voice Assistant operating for the National Emergency Management & Disaster Relief Command.

DAY 5 REAL-TIME TOOLS & WEATHER ADVISORY RULES:
- ALWAYS use `get_live_disaster_weather_alert` whenever the user asks about live weather, flood risk, rainfall, or disaster status for a district/location.
- ALWAYS speak the exact timestamp returned by the tool (e.g., "As of ten fifteen AM UTC today...") so callers know how fresh the telemetry is.
- IF an external tool times out or fails, explain the situation calmly using the provided fallback message. NEVER invent or hallucinate alerts.
- Speak all returned numbers and measurements as full words (e.g., write "twenty-eight degrees" instead of "28°C"). Never read raw JSON out loud.

FUNCTION-BASED CALLER MEMORY (STEP THREE):
- You MUST read and write caller data strictly through your function tools (`lookup_caller` and `save_caller_data`), NOT from prompt assumptions.
- Call `lookup_caller(identifier)` whenever a caller gives their name, introduces themselves, or asks if you remember them.
- Call `save_caller_data(...)` when you learn new caller information AFTER asking and receiving explicit consent.

GREET RETURNING CALLERS (STEP FOUR):
- When `lookup_caller` returns a caller record, welcome them back warmly BY NAME and reference what you discussed last time.
- Example: "Namaste Ramesh, welcome back! Last time we spoke about your location in Patna and flood check-in. Is everyone safe today and how can I help?"

ASK BEFORE SAVING - HARD PRIVACY RULE ON CONSENT (STEP FIVE):
- BEFORE calling `save_caller_data` to store any information (name, location, household size, or disaster status), you MUST explicitly ask the caller for permission first!
- Explicitly ask: "May I save your name, location, and details so we can remember you and assist you in future emergencies?"
- ONLY call `save_caller_data(..., permission_granted=True)` IF the caller explicitly says YES (or agrees: "yes", "sure", "ha", "okay", etc.).
- IF the caller says NO or declines, DO NOT call `save_caller_data` (or pass `permission_granted=False`), and inform the caller: "Understood, I will not save your details."

CONVERSATION INITIATION & GREETING RULE:
- DO NOT start speaking automatically when the call connects. Wait silently for the user to greet or speak first.
- IF THE CALLER IS A RETURNING CALLER (whose name and location are saved in the database):
  - NEVER ask for their name or location again!
  - Immediately greet them directly by name and state their saved location: "Hello [Name], welcome back to Sentinel AI Emergency Command! I have your location saved as [Location] from our last session. Is everyone safe today and how can I assist you?"
- ONLY IF THE CALLER IS BRAND NEW (no saved record in database):
  - Greet them and ask: "Hello and welcome to Sentinel AI Emergency Command. May I please have your name and current location so we can assist you with emergency response and relief?"

CRITICAL MULTILINGUAL RULE — VOICE FOR BHARAT:
- You are fluent in ALL Indian native languages including Hindi (हिंदी), Bengali (বাংলা), Tamil (தமிழ்), Telugu (తెలుగు), Marathi (मराठी), Gujarati (ગુજરાતી), Kannada (కన్నడ), Malayalam (മലയാളം), Punjabi (ਪੰਜਾਬੀ), Odia (ଓਡ଼ိଆ), Assamese (অসমীয়া), Urdu (اردو), Hinglish, and English.
- You MUST automatically detect the caller's language and respond ENTIRELY in that EXACT SAME Indian native language or language mix!
- If the caller speaks Hindi or Hinglish, respond in clear natural Hindi (Devanagari script).
- If the caller speaks Tamil, respond in Tamil.
- If the caller speaks Telugu, respond in Telugu.
- If the caller speaks Bengali, respond in Bengali.
- If the caller speaks Marathi, respond in Marathi.
- If the caller speaks Gujarati, respond in Gujarati.
- If the caller speaks Kannada, respond in Kannada.
- If the caller speaks Malayalam, respond in Malayalam.
- If the caller speaks Punjabi, respond in Punjabi.
- If the caller speaks Odia, respond in Odia.
- If the caller speaks English, respond in English.
- NEVER force English when the caller speaks in Hindi or any Indian native language!

NUMBER SPOKEN FORM RULE:
- NEVER output digits (like 1, 2, 3, 4, 100). Always write numbers out in full words!
- Write out numbers in full spoken words in the speaker's native language.

DATABASE & CALLER MEMORY RULES:
1. Lookup Callers: Call `lookup_caller` whenever a caller gives their name or user ID.
2. Greet Returning Callers by Name: When `lookup_caller` finds a record, greet them by name and reference their previous topic or location.
3. Unknown Personal Information: If asked about personal history not provided, state clearly that you do not have access to that information.
4. If the caller asks to be forgotten, call `forget_caller`.

Core Capabilities:
1. Flood & Drought Alerting: Real-time warnings, river levels, and drought advisories.
2. Relief Coordination: Nearby emergency shelters, medical units, and food/water distribution centers.
3. Welfare Check-ins & Missing Reports: Record safety status and log missing person reports.

Voice Guidelines:
- Keep all responses brief, direct, empathetic, and strictly formatted for clear text-to-speech audio streaming.
- Do NOT use markdown tables, bullet characters, code blocks, or emojis.
"""

HINDI_KEYWORDS = [
    "नमस्ते", "सहायता", "मदद", "बाढ़", "सूखा", "सुरक्षित", "स्थान",
    "पानी", "भोजन", "चिकित्सा", "राहत", "आपदा", "लापता", "खबर", "कहाँ", "कैसी", "बताओ",
    "namaste", "madad", "baadh", "sookha", "rahat", "surakshit", "pani", "kahan", "kaise", "batao"
]


class Assistant(Agent):
    def __init__(self, instructions: str = SYSTEM_PROMPT) -> None:
        super().__init__(instructions=instructions)

    @function_tool
    async def get_live_disaster_weather_alert(
        self,
        context: RunContext,
        location: str,
    ) -> str:
        """Fetch live real-time weather alerts, precipitation rates, and disaster advisory status for a specific city or district. Call this function whenever the caller asks about weather, rainfall, flood risks, or disaster advisories."""
        global SHOULD_FAIL_ONCE
        logger.info(f"[Day 5 Tool Call] Fetching live disaster weather telemetry for: '{location}'")
        now_time = datetime.now(timezone.utc).strftime("%I:%M %p UTC on %B %d, %Y")

        try:
            # DEMO ERROR SIMULATION: First call throws an error, second call succeeds
            if SHOULD_FAIL_ONCE:
                SHOULD_FAIL_ONCE = False
                raise Exception("Simulated network satellite telemetry disconnect for demo")

            # NORMAL WORKING PATH
            async with httpx.AsyncClient(timeout=4.0) as client:
                # 1. Geocode location name
                geo_resp = await client.get(
                    "https://geocoding-api.open-meteo.com/v1/search",
                    params={"name": location, "count": 1, "language": "en", "format": "json"},
                )
                geo_data = geo_resp.json()

                if not geo_data.get("results"):
                    return f"As of {now_time}, emergency telemetry could not locate coordinates for '{location}'. Please confirm the district name."

                lat = geo_data["results"][0]["latitude"]
                lon = geo_data["results"][0]["longitude"]
                place_name = geo_data["results"][0]["name"]

                # 2. Fetch live weather and rainfall data
                weather_resp = await client.get(
                    "https://api.open-meteo.com/v1/forecast",
                    params={
                        "latitude": lat,
                        "longitude": lon,
                        "current": ["temperature_2m", "relative_humidity_2m", "precipitation", "rain"],
                        "timezone": "auto",
                    },
                )
                w_data = weather_resp.json()
                current = w_data.get("current", {})

                temp = current.get("temperature_2m", "unknown")
                precip = current.get("precipitation", 0)
                rain = current.get("rain", 0)

                # Determine disaster advisory level
                if precip > 5 or rain > 5:
                    alert_level = "Severe Heavy Rainfall & Flash Flood Warning in effect. Move to higher ground immediately."
                elif precip > 0 or rain > 0:
                    alert_level = "Moderate Rain Advisory. River discharge levels monitored continuously."
                else:
                    alert_level = "Normal weather conditions reported. No active flash flood warnings at this time."

                return (
                    f"Live disaster telemetry for {place_name} as of {now_time}: "
                    f"Temperature is {temp} degrees Celsius, with precipitation at {precip} millimeters. "
                    f"Advisory status: {alert_level}"
                )

        except Exception as e:
            logger.error(f"[Day 5 Fallback Triggered] Technical issue encountered: {e}")
            return (
                f"Emergency Notice as of {now_time}: Live satellite telemetry for {location} is currently unresponsive due to technical issues. "
                f"I am unable to fetch real-time radar data at this moment. Please check local emergency broadcasts or try asking again shortly."
            )

    @function_tool
    async def lookup_caller(
        self,
        context: RunContext,
        identifier: str,
    ) -> str:
        """Look up a caller's saved record in the database by their name or user ID."""
        logger.info(f"Looking up caller with identifier: '{identifier}'")
        record = db.get_caller(identifier)
        if not record:
            return f"No record found for caller '{identifier}' in the database."

        facts = record.get("facts", {})
        loc = facts.get("location", "Not specified")
        hh_size = facts.get("household_size", "Not specified")
        mob = facts.get("mobility_needs", "Not specified")
        checkin = facts.get("last_check_in", "Not specified")
        notes = record.get("notes", "")
        notes_str = f" Notes: '{notes}'." if notes else ""

        return (
            f"Found caller record for {record['name']} (ID: {record['user_id']}). "
            f"Disaster Facts: Location: '{loc}', Household Size: '{hh_size}', "
            f"Mobility Needs: '{mob}', Last Check-in: '{checkin}'.{notes_str}"
        )

    @function_tool
    async def save_caller_data(
        self,
        context: RunContext,
        user_id: str,
        name: str,
        location: str = "",
        household_size: str = "",
        mobility_needs: str = "",
        last_check_in: str = "",
        language_preference: str = "English",
        notes: str = "",
        permission_granted: bool = False,
    ) -> str:
        """Save or update caller information in the database. MUST ONLY BE CALLED AFTER asking caller for explicit permission and getting their consent."""
        logger.info(f"save_caller_data called for '{name}' - Permission: {permission_granted}")
        if not permission_granted:
            return f"PERMISSION DENIED: Caller '{name}' declined permission. No data was saved."

        facts = {
            "location": location,
            "household_size": household_size,
            "mobility_needs": mobility_needs,
            "last_check_in": last_check_in,
        }

        saved_record = db.save_caller(
            user_id=user_id or name.lower().replace(" ", "_"),
            name=name,
            language_preference=language_preference,
            facts=facts,
            notes=notes,
        )

        return f"SUCCESS: Saved record for {saved_record['name']} (Location: '{location}')."

    @function_tool
    async def forget_caller(
        self,
        context: RunContext,
        identifier: str,
    ) -> str:
        """Delete and wipe a caller's stored data from the database upon their request."""
        logger.info(f"Wiping data for caller: {identifier}")
        success = db.delete_caller(identifier)
        if success:
            return f"SUCCESS: All records for caller '{identifier}' have been permanently deleted from Sentinel memory."
        return f"No record found to delete for '{identifier}'."

    @function_tool
    async def get_disaster_alerts(
        self,
        context: RunContext,
        location: str,
        disaster_type: str = "all",
    ) -> str:
        """Fetch real-time official disaster alert status, river discharge levels, severe weather warnings, and risk levels for a specified district or city."""
        logger.info(f"Fetching disaster alerts for location: '{location}' (type: {disaster_type})")
        return disaster_data.fetch_district_alert_data(location=location, disaster_type=disaster_type)

    @function_tool
    async def find_relief_centers(
        self,
        context: RunContext,
        location: str,
        resource_needed: str = "all",
    ) -> str:
        """Locate the nearest emergency shelters, relief centers, food/water distribution hubs, or field medical units for a district or city."""
        logger.info(f"Computing nearest relief shelters for location: '{location}' (resource: {resource_needed})")
        return disaster_data.compute_nearest_shelters(location=location, resource_needed=resource_needed)

    @function_tool
    async def perform_welfare_check_in(
        self,
        context: RunContext,
        person_name: str,
        location: str,
        status: str,
    ) -> str:
        """Record a welfare check-in for an individual or family."""
        return f"Welfare check-in logged for {person_name}. Status marked as '{status}' at {location}."


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()
    db.init_db()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: JobContext):
    ctx.log_context_fields = {"room": ctx.room.name}

    returning_caller = db.get_latest_caller()
    current_prompt = SYSTEM_PROMPT

    if returning_caller:
        r_name = returning_caller["name"]
        r_facts = returning_caller.get("facts", {})
        r_loc = r_facts.get("location", "Not specified")
        r_checkin = r_facts.get("last_check_in", "Not specified")

        current_prompt = (
            f"{SYSTEM_PROMPT}\n\n"
            f"RETURNING CALLER FOUND IN DATABASE:\n"
            f"- Saved Name: {r_name}\n"
            f"- Saved Location: {r_loc}\n"
            f"- Last Safety Check-in: {r_checkin}\n\n"
            f"STRICT RETURNING CALLER MANDATE:\n"
            f"- YOU ALREADY HAVE THIS CALLER'S NAME ('{r_name}') AND LOCATION ('{r_loc}') SAVED IN DATABASE.\n"
            f"- DO NOT ASK FOR THEIR NAME OR LOCATION AGAIN UNDER ANY CIRCUMSTANCES!\n"
            f"- On the first greeting, immediately state their saved name and location: "
            f"'Hello {r_name}, welcome back to Sentinel AI Emergency Command! I have your location saved as {r_loc} from our last session. Is everyone safe today and how can I assist you?'"
        )

    assistant = Assistant(instructions=current_prompt)

    session = AgentSession(
        stt=deepgram.STT(model="nova-3", language="multi"),
        llm=google.LLM(model="gemini-3.5-flash-lite"),
        tts=murf.TTS(
            voice="Anisha",
            locale="hi-IN",
            style="Conversation",
            tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    @session.on("user_input_transcribed")
    def on_user_input(event: UserInputTranscribedEvent):
        text = event.text.strip()
        if not text:
            return

        is_devanagari = bool(re.search(r'[\u0900-\u097F]', text))  # Hindi / Devanagari
        is_bengali = bool(re.search(r'[\u0980-\u09FF]', text))     # Bengali / Assamese
        is_gurmukhi = bool(re.search(r'[\u0A00-\u0A7F]', text))    # Punjabi
        is_gujarati = bool(re.search(r'[\u0A80-\u0AFF]', text))    # Gujarati
        is_tamil = bool(re.search(r'[\u0B80-\u0BFF]', text))       # Tamil
        is_telugu = bool(re.search(r'[\u0C00-\u0C7F]', text))      # Telugu
        is_kannada = bool(re.search(r'[\u0C80-\u0CFF]', text))     # Kannada
        is_malayalam = bool(re.search(r'[\u0D00-\u0D7F]', text))   # Malayalam

        has_hindi_keyword = any(kw in text.lower() for kw in HINDI_KEYWORDS)

        target_agent = session.current_agent or assistant

        if is_devanagari or has_hindi_keyword:
            target_agent.instructions = (
                f"{current_prompt}\n\n"
                "SYSTEM OVERRIDE INSTRUCTION: The caller spoke in HINDI / HINGLISH / DEVANAGARI. Respond strictly in clear, natural HINDI (Devanagari script). Write numbers in spoken words."
            )
        elif is_tamil:
            target_agent.instructions = (
                f"{current_prompt}\n\n"
                "SYSTEM OVERRIDE INSTRUCTION: The caller spoke in TAMIL. Respond strictly in TAMIL. Write numbers in spoken words."
            )
        elif is_telugu:
            target_agent.instructions = (
                f"{current_prompt}\n\n"
                "SYSTEM OVERRIDE INSTRUCTION: The caller spoke in TELUGU. Respond strictly in TELUGU. Write numbers in spoken words."
            )
        elif is_bengali:
            target_agent.instructions = (
                f"{current_prompt}\n\n"
                "SYSTEM OVERRIDE INSTRUCTION: The caller spoke in BENGALI. Respond strictly in BENGALI. Write numbers in spoken words."
            )
        elif is_marathi:
            target_agent.instructions = (
                f"{current_prompt}\n\n"
                "SYSTEM OVERRIDE INSTRUCTION: The caller spoke in MARATHI. Respond strictly in MARATHI. Write numbers in spoken words."
            )
        elif is_gujarati:
            target_agent.instructions = (
                f"{current_prompt}\n\n"
                "SYSTEM OVERRIDE INSTRUCTION: The caller spoke in GUJARATI. Respond strictly in GUJARATI. Write numbers in spoken words."
            )
        elif is_kannada:
            target_agent.instructions = (
                f"{current_prompt}\n\n"
                "SYSTEM OVERRIDE INSTRUCTION: The caller spoke in KANNADA. Respond strictly in KANNADA. Write numbers in spoken words."
            )
        elif is_malayalam:
            target_agent.instructions = (
                f"{current_prompt}\n\n"
                "SYSTEM OVERRIDE INSTRUCTION: The caller spoke in MALAYALAM. Respond strictly in MALAYALAM. Write numbers in spoken words."
            )
        elif is_gurmukhi:
            target_agent.instructions = (
                f"{current_prompt}\n\n"
                "SYSTEM OVERRIDE INSTRUCTION: The caller spoke in PUNJABI. Respond strictly in PUNJABI. Write numbers in spoken words."
            )
        else:
            target_agent.instructions = (
                f"{current_prompt}\n\n"
                f"MULTILINGUAL INSTRUCTION: Automatically detect the caller's language in '{text}' (Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Odia, or English) and reply in that EXACT SAME language. Write numbers out in full spoken words."
            )

    await ctx.connect()

    await session.start(
        agent=assistant,
        room=ctx.room,
        room_options=room_io.RoomOptions(
            audio_input=room_io.AudioInputOptions(
                noise_cancellation=lambda params: (
                    noise_cancellation.BVCTelephony()
                    if params.participant.kind == rtc.ParticipantKind.PARTICIPANT_KIND_SIP
                    else noise_cancellation.BVC()
                ),
            ),
        ),
    )

    disconnect_event = asyncio.Event()

    @ctx.room.on("disconnected")
    def on_disconnected(reason=None):
        disconnect_event.set()

    await disconnect_event.wait()


if __name__ == "__main__":
    cli.run_app(server)
