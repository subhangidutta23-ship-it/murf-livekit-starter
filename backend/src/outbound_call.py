import asyncio
import os
import sys
from dotenv import load_dotenv
from livekit.api import LiveKitAPI, CreateAgentDispatchRequest
from livekit.protocol.sip import CreateSIPParticipantRequest

load_dotenv(".env.local")

LIVEKIT_URL = os.getenv("LIVEKIT_URL")
LIVEKIT_API_KEY = os.getenv("LIVEKIT_API_KEY")
LIVEKIT_API_SECRET = os.getenv("LIVEKIT_API_SECRET")

# Pre-filled with your Trunk ID and Linphone URI
SIP_TRUNK_ID = os.getenv("LIVEKIT_SIP_TRUNK_ID", "ST_FgHmRR7ELEDf")
LINPHONE_TARGET = os.getenv("LINPHONE_SIP_URI", "sip:subhangidutta23@sip.linphone.org")

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

async def make_outbound_call():
    if not LIVEKIT_URL or not LIVEKIT_API_KEY or not LIVEKIT_API_SECRET:
        print("ERROR: Missing LiveKit API credentials in .env.local")
        sys.exit(1)

    print(f"Initiating outbound disaster alert call to {LINPHONE_TARGET} via Trunk {SIP_TRUNK_ID}...")

    # Extract SIP username/phone number from SIP URI (e.g. sip:subhangidutta23@sip.linphone.org -> subhangidutta23)
    sip_call_to = LINPHONE_TARGET
    if sip_call_to.startswith("sip:"):
        sip_call_to = sip_call_to[4:]
    if "@" in sip_call_to:
        sip_call_to = sip_call_to.split("@")[0]

    async with LiveKitAPI(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET) as api:
        room_name = "outbound-disaster-check"

        # 1. Dispatch agent worker to room
        try:
            dispatch_req = CreateAgentDispatchRequest(
                agent_name="my-agent",
                room=room_name,
            )
            dispatch = await api.agent_dispatch.create_dispatch(dispatch_req)
            print(f"[DISPATCH] Agent worker dispatched to room (ID: {dispatch.id})")
        except Exception as e:
            print(f"[DISPATCH] Note: {e}")

        # 2. Dial SIP participant
        req = CreateSIPParticipantRequest(
            sip_trunk_id=SIP_TRUNK_ID,
            sip_call_to=sip_call_to,
            room_name=room_name,
            participant_identity="phone_subhangidutta23",
            participant_name="Subhangi Dutta",
            display_name="Sentinel Emergency Command",
        )

        try:
            participant = await api.sip.create_sip_participant(req)
            print("--------------------------------------------------")
            print(f"[SUCCESS] Call dispatched successfully!")
            print(f"Room Name: {room_name}")
            print(f"Participant ID: {participant.participant_id}")
            print("--------------------------------------------------")
        except Exception as e:
            print(f"[FAILED] Failed to place call: {e}")

if __name__ == "__main__":
    asyncio.run(make_outbound_call())