import asyncio
import logging
import os
import re
from datetime import datetime, timezone
import httpx

from dotenv import load_dotenv, find_dotenv
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
import outbound_call
from prompt import SYSTEM_PROMPT, ESCALATION_MANDATE

logger = logging.getLogger("agent")

load_dotenv(find_dotenv(".env.local"))
load_dotenv()

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
        facts = record.get("facts", {})
        loc = record.get("location") or facts.get("location", "Not specified")
        last_check_in = facts.get("last_check_in", "")
        notes = record.get("notes", "")
        
        parts = [f"Found caller record for {record.get('name')} in location '{loc}'."]
        if last_check_in:
            parts.append(f"Last check-in: {last_check_in}.")
        if notes:
            parts.append(f"Notes: {notes}.")
        return " ".join(parts)

    @function_tool
    async def get_disaster_alerts(
        self,
        context: RunContext,
        location: str,
    ) -> str:
        """Fetch district flood and severe weather alert status."""
        return disaster_data.fetch_district_alert_data(location=location)

    @function_tool
    async def find_relief_centers(
        self,
        context: RunContext,
        location: str,
        resource_needed: str = "all",
    ) -> str:
        """Find nearest emergency relief centers and shelters with capacity details."""
        return disaster_data.compute_nearest_shelters(location=location, resource_needed=resource_needed)

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

    @function_tool
    async def create_escalation(
        self,
        context: RunContext,
        caller_name: str,
        issue_type: str,
        summary: str,
        urgency_level: str = "MEDIUM",
        location: str = "",
        preferred_contact: str = "Phone Call",
        permission_granted: bool = False,
    ) -> str:
        """
        STRICT MANDATORY CONSENT RULE: DO NOT CALL THIS TOOL ON TURN 1 WHEN A CALLER MENTIONS AN EMERGENCY!
        You MUST FIRST verbally ask the caller out loud in Turn 1:
        'To dispatch human emergency help, I need to share your name, location, and condition with our human disaster response team. May I have your permission to share these details?'
        ONLY invoke this tool in Turn 2 AFTER the caller explicitly says YES / grants permission!
        """
        logger.info(f"[Day 7 Escalation Tool] Requested for '{caller_name}' (Urgency: {urgency_level}) - Consent: {permission_granted}")
        
        if not permission_granted:
            return "ESCALATION CANCELLED: Caller has not yet granted explicit permission to forward information to human rescue dispatchers. Ask for permission first!"

        # Fetch saved caller record if available and matching caller_name for user_id mapping
        latest_record = db.get_latest_caller()
        user_id = ""
        if latest_record and (latest_record.get("name", "").strip().lower() == caller_name.strip().lower()):
            user_id = latest_record.get("user_id", "")

        # Save ticket in SQLite database (handles PII sanitization and deduplication)
        ticket = db.save_escalation_request(
            user_id=user_id,
            caller_name=caller_name,
            issue_type=issue_type,
            summary=summary,
            urgency_level=urgency_level,
            location=location,
            preferred_contact=preferred_contact,
        )

        ref_id = ticket["ticket_id"]
        is_updated = ticket.get("is_updated", False)
        status_action = "UPDATED existing open request" if is_updated else "CREATED new emergency escalation ticket"

        logger.info(f"🚨 [HUMAN DISPATCH TICKET {status_action.upper()}] {ticket}")

        # Send webhook notification if configured (supports Discord, Slack, Webhook.site, or custom APIs)
        webhook_url = os.getenv("WEBHOOK_URL") or os.getenv("DISASTER_WEBHOOK_URL") or os.getenv("DISCORD_WEBHOOK_URL")
        if webhook_url:
            async with httpx.AsyncClient() as client:
                webhook_payload = {
                    "event": "human_escalation_created" if not is_updated else "human_escalation_updated",
                    "ref_id": ref_id,
                    "caller_name": ticket["caller_name"],
                    "location": ticket["location"] or "Not specified",
                    "urgency_level": ticket["urgency_level"],
                    "issue_type": ticket["issue_type"],
                    "summary": ticket["summary"],
                    "status": ticket["status"],
                    "preferred_contact": ticket["preferred_contact"],
                    "updated_at": ticket["updated_at"],
                    "embeds": [{
                        "title": f"🚨 Emergency Escalation Ticket: {ref_id} ({ticket['urgency_level']})",
                        "color": 15158332 if ticket['urgency_level'] in ("EMERGENCY", "HIGH") else 3447003,
                        "fields": [
                            {"name": "Caller Name", "value": ticket['caller_name'], "inline": True},
                            {"name": "Location", "value": ticket['location'] or "Not specified", "inline": True},
                            {"name": "Urgency Level", "value": ticket['urgency_level'], "inline": True},
                            {"name": "Status", "value": ticket['status'], "inline": True},
                            {"name": "Issue", "value": ticket['issue_type'], "inline": False},
                            {"name": "Sanitized Summary", "value": ticket['summary'], "inline": False},
                            {"name": "Preferred Contact", "value": ticket['preferred_contact'], "inline": True},
                        ],
                        "footer": {"text": f"Logged at {ticket['updated_at']}"}
                    }]
                }
                try:
                    await client.post(webhook_url, json=webhook_payload)
                    logger.info(f"✅ [WEBHOOK NOTIFICATION SENT] Dispatched to {webhook_url}")
                except Exception as e:
                    logger.error(f"Webhook post failed: {e}")

        if is_updated:
            return (
                f"SUCCESS: Updated existing open emergency ticket with Reference ID '{ref_id}' (Urgency: {ticket['urgency_level']}). "
                f"Inform the caller that human dispatchers have received the updated details and emergency assistance is tracking their ticket."
            )
        else:
            return (
                f"SUCCESS: Escalation ticket created successfully with Reference ID '{ref_id}' (Urgency: {ticket['urgency_level']}). "
                f"Inform the caller that human dispatchers have received the ticket and will contact them shortly."
            )

    @function_tool
    async def check_escalation_status(
        self,
        context: RunContext,
        identifier: str = "",
    ) -> str:
        """
        Check the status of an emergency escalation request (by Reference ID or caller name).
        Returns request status: OPEN, IN_PROGRESS, or RESOLVED.
        """
        logger.info(f"[Escalation Status Query] Looking up status for: '{identifier}'")
        ticket = db.get_escalation(identifier)
        if not ticket:
            latest_caller = db.get_latest_caller()
            if latest_caller:
                ticket = db.get_escalation(latest_caller.get("name", ""))

        if not ticket:
            return f"No emergency escalation request found for '{identifier}'."

        ref_id = ticket["ticket_id"]
        status = ticket["status"]
        urgency = ticket["urgency_level"]
        res_notes = ticket["resolution_notes"]

        msg = f"Escalation Request '{ref_id}' for {ticket['caller_name']} is currently '{status}' with urgency level '{urgency}'."
        if res_notes:
            msg += f" Resolution notes: {res_notes}."
        if status == "OPEN":
            msg += " Human emergency dispatchers have received the request and are assigning response teams."
        elif status == "IN_PROGRESS":
            msg += " Emergency response teams have been dispatched to the location."
        elif status == "RESOLVED":
            msg += " The issue has been marked as resolved by emergency command."

        return msg

    @function_tool
    async def resolve_escalation(
        self,
        context: RunContext,
        ticket_id: str,
        resolution_notes: str = "Issue resolved by emergency dispatch team.",
    ) -> str:
        """
        Mark an emergency escalation ticket as RESOLVED and trigger an automated resolution callback call to notify the caller.
        """
        logger.info(f"[Escalation Resolution] Resolving ticket '{ticket_id}' with notes: '{resolution_notes}'")
        updated = db.update_escalation_status(ticket_id, new_status="RESOLVED", resolution_notes=resolution_notes)
        if not updated:
            return f"Error: No escalation ticket found matching ID '{ticket_id}'."

        # Trigger Day 6/7 outbound resolution callback to notify caller
        asyncio.create_task(
            outbound_call.trigger_resolution_callback(
                ticket_id=updated["ticket_id"],
                caller_name=updated["caller_name"],
                location=updated["location"],
                resolution_notes=resolution_notes,
            )
        )

        return (
            f"SUCCESS: Ticket '{updated['ticket_id']}' for {updated['caller_name']} has been marked as RESOLVED. "
            f"An automated resolution callback has been dispatched to notify the caller."
        )


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
        location_clause = f"- Saved Location: {user_location}\n" if user_location else ""
        current_prompt = (
            f"{SYSTEM_PROMPT}\n\n"
            f"SAVED CALLER RECOGNITION:\n"
            f"- Name: {user_name}\n"
            f"{location_clause}\n"
            f"INSTRUCTIONS:\n"
            f"- You are speaking with {user_name}.\n"
            f"- Address them directly by name ({user_name}).\n"
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

        logger.info(f"🎤 [USER INPUT TRANSCRIBED]: '{text}'")

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

    @session.on("user_state_changed")
    def on_user_state_changed(event):
        logger.info(f"🗣️ [USER STATE]: {event.new_state}")

    @session.on("agent_state_changed")
    def on_agent_state_changed(event):
        logger.info(f"🤖 [AGENT STATE]: {event.new_state}")

    @session.on("error")
    def on_session_error(event):
        logger.error(f"❌ [SESSION ERROR]: {event}")

    @ctx.room.on("participant_connected")
    def on_participant_connected(participant: rtc.RemoteParticipant):
        logger.info(f"👤 [PARTICIPANT CONNECTED]: {participant.identity} (Kind: {participant.kind})")

    @ctx.room.on("track_subscribed")
    def on_track_subscribed(track: rtc.Track, publication: rtc.RemoteTrackPublication, participant: rtc.RemoteParticipant):
        logger.info(f"🔊 [TRACK SUBSCRIBED]: Kind={track.kind}, SID={publication.sid}, Participant={participant.identity}")

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

    await session.start(
        agent=assistant,
        room=ctx.room,
    )

    # DYNAMIC OPENING GREETING
    if is_outbound_sip:
        # Give SIP media pipeline 1.8 seconds to establish before pushing TTS stream
        await asyncio.sleep(1.8)
        
        if has_saved_caller:
            if user_location:
                opening_text = (
                    f"Hello {user_name}! This is an automated emergency check from Sentinel Command regarding the flood alert near {user_location}. "
                    f"To stop automated checks, say stop calling me. "
                    f"How are you doing right now, and are you safe?"
                )
            else:
                opening_text = (
                    f"Hello {user_name}! This is an automated emergency check from Sentinel Command regarding the flood alert. "
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
    else:
        # WebRTC / Browser Session Opening
        if has_saved_caller:
            if user_location:
                opening_text = (
                    f"Hello {user_name}! Welcome back to Sentinel Emergency Command. "
                    f"I have your location saved as {user_location}. Are you safe today and how can I assist you?"
                )
            else:
                opening_text = (
                    f"Hello {user_name}! Welcome back to Sentinel Emergency Command. "
                    f"Are you safe today and how can I assist you?"
                )
        else:
            opening_text = (
                "Hello! I am Sentinel from the National Emergency Management Command. "
                "Are you safe, and how can I help you today?"
            )
        
        await session.say(opening_text, allow_interruptions=True)

    disconnect_event = asyncio.Event()

    @ctx.room.on("disconnected")
    def on_disconnected(reason=None):
        disconnect_event.set()

    await disconnect_event.wait()


if __name__ == "__main__":
    cli.run_app(server)