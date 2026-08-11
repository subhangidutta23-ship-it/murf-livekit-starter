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
from prompt import SYSTEM_PROMPT

logger = logging.getLogger("agent")

load_dotenv(".env.local")

SHOULD_FAIL_ONCE = True

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
        """Fetch live real-time weather alerts and disaster advisory status."""
        global SHOULD_FAIL_ONCE
        logger.info(f"[Day 5 Tool Call] Fetching telemetry for: '{location}'")
        now_time = datetime.now(timezone.utc).strftime("%I:%M %p UTC on %B %d, %Y")

        try:
            if SHOULD_FAIL_ONCE:
                SHOULD_FAIL_ONCE = False
                raise Exception("Simulated network disconnect")

            async with httpx.AsyncClient(timeout=4.0) as client:
                geo_resp = await client.get(
                    "https://geocoding-api.open-meteo.com/v1/search",
                    params={"name": location, "count": 1, "language": "en", "format": "json"},
                )
                geo_data = geo_resp.json()

                if not geo_data.get("results"):
                    return f"As of {now_time}, emergency telemetry could not locate coordinates for '{location}'."

                lat = geo_data["results"][0]["latitude"]
                lon = geo_data["results"][0]["longitude"]
                place_name = geo_data["results"][0]["name"]

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

                if precip > 5 or rain > 5:
                    alert_level = "Severe Heavy Rainfall & Flash Flood Warning in effect."
                elif precip > 0 or rain > 0:
                    alert_level = "Moderate Rain Advisory."
                else:
                    alert_level = "Normal weather conditions reported."

                return (
                    f"Live disaster telemetry for {place_name} as of {now_time}: "
                    f"Temperature is {temp} degrees Celsius, with precipitation at {precip} millimeters. "
                    f"Advisory status: {alert_level}"
                )

        except Exception as e:
            logger.error(f"[Fallback Triggered] Exception: {e}")
            return (
                f"Emergency Notice as of {now_time}: Live satellite telemetry for {location} is currently unresponsive. "
                f"Please check local emergency broadcasts."
            )

    @function_tool
    async def opt_out_caller(self, context: RunContext) -> str:
        """Opt out caller from future automated disaster phone alerts."""
        logger.info("Caller opted out from automated calls.")
        return "SUCCESS: Caller opted out from future emergency voice notifications."

    @function_tool
    async def forget_caller(
        self,
        context: RunContext,
        identifier: str = "",
    ) -> str:
        """Delete and wipe the caller's stored record from the database upon their explicit request."""
        logger.info("Wiping stored caller data from SQLite database...")
        latest_record = db.get_latest_caller()
        target_id = identifier or (latest_record.get("user_id") if latest_record else "")
        
        if target_id:
            db.delete_caller(target_id)
            return "SUCCESS: All your stored records and details have been permanently deleted from Sentinel database."
        return "No active record was found in the database to delete."

    @function_tool
    async def lookup_caller(
        self,
        context: RunContext,
        identifier: str,
    ) -> str:
        """Look up caller in database."""
        record = db.get_caller(identifier)
        if not record:
            return f"No record found for '{identifier}'."
        loc = record.get("location") or record.get("facts", {}).get("location", "Not specified")
        return f"Found record for {record.get('name')} in location '{loc}'."

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
        """Save or update caller data with explicit permission."""
        if not permission_granted:
            return "PERMISSION DENIED: No data saved."
        saved = db.save_caller(
            user_id=user_id or name.lower().replace(" ", "_"),
            name=name,
            language_preference=language_preference,
            facts={"location": location, "household_size": household_size},
            notes=notes,
        )
        return f"SUCCESS: Saved record for {saved.get('name')}."


server = AgentServer()


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load(min_speech_duration=0.1, min_silence_duration=0.3)
    db.init_db()


server.setup_fnc = prewarm


@server.rtc_session(agent_name="my-agent")
async def my_agent(ctx: JobContext):
    ctx.log_context_fields = {"room": ctx.room.name}

    is_outbound_sip = "outbound" in ctx.room.name or "sip" in ctx.room.name
    
    # Query database dynamically
    caller_record = db.get_latest_caller()
    
    user_name = ""
    user_location = ""
    
    if caller_record:
        user_name = str(caller_record.get("name") or caller_record.get("user_id", "")).strip()
        user_location = str(caller_record.get("location") or "").strip()
        if not user_location and isinstance(caller_record.get("facts"), dict):
            user_location = str(caller_record.get("facts", {}).get("location", "")).strip()

    has_saved_caller = bool(user_name)

    if has_saved_caller:
        current_prompt = (
            f"{SYSTEM_PROMPT}\n\n"
            f"SAVED CALLER RECOGNITION:\n"
            f"- Name: {user_name}\n"
            f"- Saved Location: {user_location}\n\n"
            f"INSTRUCTIONS:\n"
            f"- You are calling {user_name} in {user_location}.\n"
            f"- Ask about their safety status.\n"
            f"- If requested to delete, wipe, or forget their details, invoke `forget_caller()` tool.\n"
        )
    else:
        current_prompt = (
            f"{SYSTEM_PROMPT}\n\n"
            f"NEW CALLER:\n"
            f"- Greet warmly as Sentinel emergency command.\n"
            f"- Ask for their name and safety status.\n"
        )

    assistant = Assistant(instructions=current_prompt)

    session = AgentSession(
        stt=deepgram.STT(model="nova-3", language="multi"),
        llm=google.LLM(model="gemini-3.5-flash-lite"),
        tts=murf.TTS(
            voice="Anisha",
            locale="hi-IN",
            style="Conversation",
            tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=1),
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=False,
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
                "Respond ENTIRELY in natural HINDI (Devanagari script). Write numbers out as spoken words."
            )
        else:
            target_agent.instructions = (
                f"{current_prompt}\n\n"
                "Respond ENTIRELY in natural ENGLISH. Write numbers out as spoken words."
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

    # DYNAMIC OUTBOUND OPENING WITH FIXED AUDIO TIMING
    if is_outbound_sip:
        # Give SIP media pipeline 1.8 seconds to establish before pushing TTS stream
        await asyncio.sleep(1.8)
        
        if has_saved_caller:
            opening_text = (
                f"Hello {user_name}! This is an automated emergency check from Sentinel Command regarding the flood alert near {user_location}. "
                f"To stop automated checks, say stop calling me. "
                f"How are you doing right now, and are you safe?"
            )
        else:
            opening_text = (
                "Hello! This is an automated emergency welfare check from Sentinel Command regarding the flood alert. "
                "To stop automated checks, say stop calling me. "
                "Are you and your household safe?"
            )
        
        await session.say(opening_text, allow_interruptions=True)

    disconnect_event = asyncio.Event()

    @ctx.room.on("disconnected")
    def on_disconnected(reason=None):
        disconnect_event.set()

    await disconnect_event.wait()


if __name__ == "__main__":
    cli.run_app(server)
