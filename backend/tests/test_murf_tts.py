import asyncio
import aiohttp
from dotenv import load_dotenv
load_dotenv('.env.local')

from livekit.plugins import murf

async def main():
    print("Testing Murf TTS with aiohttp session...")
    async with aiohttp.ClientSession() as session:
        try:
            tts = murf.TTS(
                voice="Anisha",
                locale="hi-IN",
                style="Conversation",
                text_pacing=True,
                http_session=session,
            )
            text = "I will connect you to our shelter information specialist. Hello! I am the Shelter Information Specialist for Disaster Response."
            stream = tts.synthesize(text)
            chunk_count = 0
            async for chunk in stream:
                chunk_count += 1
                print(f"Received audio chunk #{chunk_count}: {len(chunk.frame.data)} bytes")
            print("✅ Murf TTS synthesis succeeded!")
        except Exception as e:
            print(f"❌ Murf TTS error: {e}")

if __name__ == '__main__':
    asyncio.run(main())
