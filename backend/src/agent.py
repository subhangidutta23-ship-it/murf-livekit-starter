import asyncio
import logging
import re

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

logger = logging.getLogger("agent")

load_dotenv(".env.local")

SYSTEM_PROMPT = """You are Sentinel, an emergency Disaster Response Voice Assistant operating for the National Emergency Management & Disaster Relief Command.

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
- As soon as the user greets you or speaks their first message, greet them back:
  "Hello and welcome to Sentinel AI Emergency Command. May I please have your name and current location so we can assist you with emergency response and relief?"
- If the caller gives their name, call `lookup_caller(name)` to see if they are a returning caller!

CRITICAL LANGUAGE RULE:
- You MUST respond in the EXACT same language that the user uses in their question.
- If the user speaks or asks in English, you MUST respond ENTIRELY in English.
- If the user speaks or asks in Hindi (or Hinglish/Devanagari), you MUST respond ENTIRELY in clear, natural Hindi using Devanagari script.
- NEVER default to Hindi when the user asks in English.

NUMBER SPOKEN FORM RULE:
- NEVER output digits (like 1, 2, 3, 4, 100). Always write numbers out in full words!
- When speaking in English, write out numbers in English words (e.g., "one", "two", "three", "four", "one hundred").
- When speaking in Hindi, write out numbers in Hindi words (e.g., "एक", "दो", "तीन", "चार", "सौ").

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

        return (
            f"Found caller record for {record['name']} (ID: {record['user_id']}). "
            f"Disaster Facts: Location: '{loc}', Household Size: '{hh_size}', "
            f"Mobility Needs: '{mob}', Last Check-in: '{checkin}'."
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
        """Fetch active flood, drought, or disaster alerts for a location."""
        loc_lower = location.lower()
        if "flood" in disaster_type.lower() or "flood" in loc_lower or "baadh" in loc_lower or "all" in disaster_type.lower():
            return f"Alert status for {location}: Level three Flash Flood Warning in effect. River levels four feet above flood stage."
        elif "drought" in disaster_type.lower() or "drought" in loc_lower or "sookha" in loc_lower:
            return f"Alert status for {location}: Stage four Extreme Drought Advisory. Mandatory water conservation in place."
        return f"Alert status for {location}: Active Flash Flood Warning and Drought Advisory."

    @function_tool
    async def find_relief_centers(
        self,
        context: RunContext,
        location: str,
        resource_needed: str = "all",
    ) -> str:
        """Find nearby emergency shelters, food/water distribution centers, and medical hubs."""
        return f"Relief centers near {location}: Central High School Shelter and Eastside Disaster Supply Hub."

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

    # Check database for returning caller
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
            f"- Name: {r_name}\n"
            f"- Location: {r_loc}\n"
            f"- Last Check-in: {r_checkin}\n\n"
            f"RETURNING CALLER GREETING INSTRUCTION:\n"
            f"- Do NOT ask for their name and location again!\n"
            f"- When the user greets you or speaks first, greet them BY NAME warmly: 'Hello {r_name}, welcome back to Sentinel AI Emergency Command! I have your location as {r_loc} from our last session. Is everyone safe today and how can I assist you?'"
        )

    assistant = Assistant(instructions=current_prompt)

    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
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

        is_devanagari = bool(re.search(r'[\u0900-\u097F]', text))
        has_hindi_keyword = any(kw in text.lower() for kw in HINDI_KEYWORDS)

        target_agent = session.current_agent or assistant
        if is_devanagari or has_hindi_keyword:
            target_agent.instructions = (
                f"{current_prompt}\n\n"
                "SYSTEM OVERRIDE INSTRUCTION: The user spoke in HINDI. Reply strictly in HINDI (Devanagari script). Write numbers in words."
            )
        else:
            target_agent.instructions = (
                f"{current_prompt}\n\n"
                "SYSTEM OVERRIDE INSTRUCTION: The user spoke in ENGLISH. Reply strictly in ENGLISH. Write numbers in words."
            )

    # 1. Connect agent to the room FIRST
    await ctx.connect()

    # 2. Start session with Assistant instance
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

    # 3. Wait for user to initiate conversation (user greets first)
    # Sentinel AI will stay silent until the caller speaks or sends a message.

    # 4. Keep agent process active
    disconnect_event = asyncio.Event()

    @ctx.room.on("disconnected")
    def on_disconnected(reason=None):
        disconnect_event.set()

    await disconnect_event.wait()


if __name__ == "__main__":
    cli.run_app(server)
