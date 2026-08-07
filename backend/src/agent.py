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

logger = logging.getLogger("agent")

load_dotenv(".env.local")

# Core system instructions explicitly enforcing strict language matching and number formatting
SYSTEM_PROMPT = """You are Sentinel, an emergency Disaster Response Voice Assistant operating for the National Emergency Management & Disaster Relief Command.

CRITICAL LANGUAGE RULE:
- You MUST respond in the EXACT same language that the user uses in their question.
- If the user speaks or asks in English, you MUST respond ENTIRELY in English.
- If the user speaks or asks in Hindi (or Hinglish/Devanagari), you MUST respond ENTIRELY in clear, natural Hindi using Devanagari script.
- NEVER default to Hindi when the user asks in English.

NUMBER SPOKEN FORM RULE:
- NEVER output digits (like 1, 2, 3, 4, 100). Always write numbers out in full words!
- When speaking in English, write out numbers in English words (e.g., "one", "two", "three", "four", "one hundred").
- When speaking in Hindi, write out numbers in Hindi words (e.g., "एक", "दो", "तीन", "चार", "सौ").

Core Capabilities:
1. Flood & Drought Alerting: Real-time warnings, river levels, and drought advisories.
2. Relief Coordination: Nearby emergency shelters, medical units, and food/water distribution centers.
3. Welfare Check-ins & Missing Reports: Record safety status and log missing person reports.

Voice Guidelines:
- Keep all responses brief, direct, empathetic, and strictly formatted for clear text-to-speech audio streaming.
- Do NOT use markdown tables, bullet characters, code blocks, or emojis.
"""

# Common Hinglish/Hindi keywords for fallback detection
HINDI_KEYWORDS = [
    "नमस्ते", "सहायता", "मदद", "बाढ़", "सूखा", "सुरक्षित", "स्थान",
    "पानी", "भोजन", "चिकित्सा", "राहत", "आपदा", "लापता", "खबर", "कहाँ", "कैसी", "बताओ",
    "namaste", "madad", "baadh", "sookha", "rahat", "surakshit", "pani", "kahan", "kaise", "batao"
]


class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions=SYSTEM_PROMPT)

    @function_tool
    async def get_disaster_alerts(
        self,
        context: RunContext,
        location: str,
        disaster_type: str = "all",
    ) -> str:
        """Fetch active flood, drought, or disaster alerts and weather warnings for a location."""
        logger.info(f"Checking disaster alerts for {location} (type: {disaster_type})")
        loc_lower = location.lower()

        if "flood" in disaster_type.lower() or "flood" in loc_lower or "baadh" in loc_lower or "all" in disaster_type.lower():
            return (
                f"Alert status for {location}: Level three Flash Flood Warning in effect until tomorrow morning. "
                f"River levels are currently four feet above flood stage. Local authorities recommend moving to higher ground "
                f"and avoiding low-lying roads. Evacuation center opened at North High School."
            )
        elif "drought" in disaster_type.lower() or "drought" in loc_lower or "sookha" in loc_lower:
            return (
                f"Alert status for {location}: Stage four Extreme Drought Advisory. Mandatory water conservation in place. "
                f"Emergency water supply hubs are active at Central Park and West Community Center between eight AM and six PM."
            )
        else:
            return (
                f"Alert status for {location}: Active Flash Flood Warning and Moderate Drought Advisory for surrounding agricultural areas. "
                f"Emergency services are on standby."
            )

    @function_tool
    async def find_relief_centers(
        self,
        context: RunContext,
        location: str,
        resource_needed: str = "all",
    ) -> str:
        """Find nearby emergency shelters, food/water distribution centers, and medical hubs."""
        logger.info(f"Searching relief centers near {location} for {resource_needed}")
        return (
            f"Relief centers near {location}: "
            f"First, Central High School Shelter offering sleeping beds, clean water, warm food, and basic medical aid. "
            f"Second, Eastside Disaster Supply Hub distributing bottled water, emergency rations, and hygiene kits daily. "
            f"Third, Red Cross Mobile Medical Unit stationed at Fifth and Main Street."
        )

    @function_tool
    async def submit_relief_request(
        self,
        context: RunContext,
        location: str,
        contact_name: str,
        supplies_needed: str,
        urgency: str = "standard",
    ) -> str:
        """Submit a request for emergency relief supplies, water, or non-life-threatening rescue assistance."""
        logger.info(f"Submitting relief request for {contact_name} at {location} - Urgency: {urgency}")
        req_id = "REL-" + str(abs(hash(contact_name + location)))[:6]
        return (
            f"Relief request {req_id} logged successfully for {contact_name} at {location}. "
            f"Requested items: {supplies_needed}. Urgency: {urgency}. "
            f"Local dispatch and volunteer relief teams have been notified for delivery prioritization."
        )

    @function_tool
    async def perform_welfare_check_in(
        self,
        context: RunContext,
        person_name: str,
        location: str,
        status: str,
        medical_needs: str = "none",
        contact_phone: str = "",
    ) -> str:
        """Record a welfare check-in for an individual or family to mark them safe or log their status."""
        logger.info(f"Welfare check-in recorded: {person_name} at {location} - Status: {status}")
        checkin_id = "WLC-" + str(abs(hash(person_name + status)))[:6]
        return (
            f"Welfare check-in {checkin_id} logged for {person_name}. Status marked as '{status}' at {location}. "
            f"Family registry updated. Emergency contacts can verify status online or via the emergency hotline."
        )

    @function_tool
    async def report_missing_person(
        self,
        context: RunContext,
        person_name: str,
        last_known_location: str,
        details: str = "",
    ) -> str:
        """File an urgent missing person report for search and rescue teams during a disaster."""
        logger.info(f"Missing person report created: {person_name} last seen at {last_known_location}")
        case_id = "MIS-" + str(abs(hash(person_name + last_known_location)))[:6]
        return (
            f"Missing person report {case_id} registered for {person_name}. Last known location: {last_known_location}. "
            f"Search and rescue coordination units and shelter intake desks have been alerted."
        )


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: JobContext):
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Voice AI pipeline using Deepgram multi-language STT and Murf TTS
    session = AgentSession(
        stt=deepgram.STT(model="nova-3", language="multi"),
        llm=google.LLM(
            model="gemini-3.5-flash-lite",
        ),
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

    # Event listener that runs on every user input turn
    @session.on("user_input_transcribed")
    def on_user_input(event: UserInputTranscribedEvent):
        text = event.text.strip()
        if not text:
            return

        logger.info(f"User transcription: '{text}'")

        # Detect Devanagari characters or Hindi keywords
        is_devanagari = bool(re.search(r'[\u0900-\u097F]', text))
        has_hindi_keyword = any(kw in text.lower() for kw in HINDI_KEYWORDS)

        # Dynamic Language Switching Logic with explicit number rules
        if is_devanagari or has_hindi_keyword:
            logger.info("Detected Hindi user input -> Directing LLM to respond in HINDI.")
            session.instructions = (
                f"{SYSTEM_PROMPT}\n\n"
                "SYSTEM OVERRIDE INSTRUCTION: The user just spoke in HINDI. "
                "You MUST reply strictly in HINDI (Devanagari script). "
                "Write all numbers as full Hindi words (e.g. 'तीन', 'चार'). Do NOT use numeric digits."
            )
        else:
            logger.info("Detected English user input -> Directing LLM to respond in ENGLISH.")
            session.instructions = (
                f"{SYSTEM_PROMPT}\n\n"
                "SYSTEM OVERRIDE INSTRUCTION: The user just spoke in ENGLISH. "
                "You MUST reply strictly in ENGLISH. Do not use Hindi. "
                "Write all numbers as full English words (e.g. 'three', 'four'). Do NOT use numeric digits."
            )

    # Start the session
    await session.start(
        agent=Assistant(),
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

    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)
