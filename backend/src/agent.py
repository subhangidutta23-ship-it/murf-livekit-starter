import logging

from dotenv import load_dotenv
from livekit import rtc
from livekit.agents import (
    Agent,
    AgentServer,
    AgentSession,
    JobContext,
    JobProcess,
    RunContext,
    cli,
    function_tool,
    room_io,
    tokenize,
)
from livekit.plugins import deepgram, google, murf, noise_cancellation, silero
from livekit.plugins.turn_detector.multilingual import MultilingualModel

logger = logging.getLogger("agent")

load_dotenv(".env.local")

SYSTEM_PROMPT = """You are Sentinel, an emergency Disaster Response Voice Assistant operating for the National Emergency Management & Disaster Relief Command.

Your primary mission is to assist citizens, first responders, and relief workers during natural disasters, specifically floods, droughts, extreme weather events, and related emergencies.

Core Capabilities & Responsibilities:
1. Flood & Drought Alerting:
   - Provide real-time disaster alerts, evacuation notices, river level warnings, drought advisories, and severe weather updates for any location requested.
   - Guide users on critical safety procedures (e.g., seeking higher ground during flash floods, emergency water preservation during severe droughts, preparing disaster kits).

2. Relief Coordination & Resource Dispatch:
   - Locate nearby emergency shelters, water and food distribution centers, medical clinics, and relief supply drop zones.
   - Submit emergency supply or dispatch requests for stranded individuals, medical supplies, clean drinking water, or rescue equipment.

3. Welfare Check-ins & Person Search:
   - Record welfare check-in status for individuals or families in affected zones (e.g., marked safe, evacuated, needing non-emergency aid).
   - Log missing person reports to aid search and rescue teams.

Voice & Tone Guidelines:
- Remain calm, clear, empathetic, authoritative, and fast-acting.
- Keep responses concise, direct, and easy to hear over voice audio. Avoid overly long speeches.
- Never use complex formatting, markdown tables, code blocks, bullet characters, emojis, or special symbols.
- Prioritize urgent safety instructions first if a user indicates immediate danger (e.g. advise calling local emergency services like 911/112 if in life-threatening danger)."""


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
        """Fetch active flood, drought, or disaster alerts and weather warnings for a location.

        Args:
            location: City, region, or zip code to check alerts for.
            disaster_type: Type of disaster to check (e.g., 'flood', 'drought', or 'all').
        """
        logger.info(f"Checking disaster alerts for {location} (type: {disaster_type})")
        loc_lower = location.lower()

        if "flood" in disaster_type.lower() or "flood" in loc_lower or "all" in disaster_type.lower():
            return (
                f"Alert status for {location}: Level 3 Flash Flood Warning in effect until tomorrow morning. "
                f"River levels are currently 4 feet above flood stage. Local authorities recommend moving to higher ground "
                f"and avoiding low-lying roads. Evacuation center opened at North High School."
            )
        elif "drought" in disaster_type.lower() or "drought" in loc_lower:
            return (
                f"Alert status for {location}: Stage 4 Extreme Drought Advisory. Mandatory water conservation in place. "
                f"Emergency water supply hubs are active at Central Park and West Community Center between 8 AM and 6 PM."
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
        """Find nearby emergency shelters, food/water distribution centers, and medical hubs.

        Args:
            location: The city, neighborhood, or area name.
            resource_needed: Specific resource required like 'shelter', 'water', 'food', 'medical', or 'all'.
        """
        logger.info(f"Searching relief centers near {location} for {resource_needed}")
        return (
            f"Relief centers near {location}: "
            f"1. Central High School Shelter (Capacity 450, offering sleeping beds, clean water, warm food, and basic medical aid). "
            f"2. Eastside Disaster Supply Hub (Distributing bottled water, emergency rations, and hygiene kits daily). "
            f"3. Red Cross Mobile Medical Unit (Stationed at 5th and Main Street)."
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
        """Submit a request for emergency relief supplies, water, or non-life-threatening rescue assistance.

        Args:
            location: Exact address or landmark location of the request.
            contact_name: Name of the person requesting aid.
            supplies_needed: Description of items needed (e.g. drinking water, infant formula, blankets, medical supplies).
            urgency: Urgency level ('critical', 'high', or 'standard').
        """
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
        """Record a welfare check-in for an individual or family to mark them safe or log their status.

        Args:
            person_name: Full name of the individual or family head.
            location: Current location or shelter address.
            status: Status update (e.g., 'safe', 'evacuated', 'sheltered', 'needs_assistance').
            medical_needs: Any medical conditions or immediate medication needs.
            contact_phone: Phone number for family follow-up.
        """
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
        """File an urgent missing person report for search and rescue teams during a disaster.

        Args:
            person_name: Full name of the missing person.
            last_known_location: Last seen location, address, or landmark.
            details: Clothing description, age, or last known timestamp.
        """
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
    # Logging setup
    ctx.log_context_fields = {
        "room": ctx.room.name,
    }

    # Set up a voice AI pipeline using Murf Falcon, Gemini, Deepgram, and the LiveKit turn detector
    session = AgentSession(
        stt=deepgram.STT(model="nova-3"),
        llm=google.LLM(
            model="gemini-3.5-flash-lite",
        ),
        tts=murf.TTS(
            voice="Anisha",
            locale="en-IN",
            style="Conversation",
            tokenizer=tokenize.basic.SentenceTokenizer(min_sentence_len=2),
            text_pacing=True,
        ),
        turn_detection=MultilingualModel(),
        vad=ctx.proc.userdata["vad"],
        preemptive_generation=True,
    )

    # Start the session, which initializes the voice pipeline and warms up the models
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

    # Join the room and connect to the user
    await ctx.connect()


if __name__ == "__main__":
    cli.run_app(server)

