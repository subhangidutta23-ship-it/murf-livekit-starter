import sys
import os
import asyncio
from unittest.mock import MagicMock

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src"))
sys.path.insert(0, src_dir)
from agent import Assistant, ShelterInformationSpecialist

async def main():
    assistant = Assistant(instructions="Test instructions", call_context={"facts": {"location": "Guwahati"}})
    
    said_messages = []
    
    class MockSession:
        def __init__(self):
            self.current_agent = assistant
        def update_agent(self, agent):
            self.current_agent = agent
        async def say(self, text, **kwargs):
            said_messages.append(text)
            
    mock_session = MockSession()
    mock_run_context = MagicMock()
    mock_run_context.session = mock_session
    
    result = await assistant.transfer_to_shelter_specialist(
        context=mock_run_context,
        location="Guwahati",
        reason="User needs shelter beds"
    )
    
    # Wait briefly for asyncio task
    await asyncio.sleep(0.1)
    
    print("=== TOOL RETURN ===")
    print(result)
    print("\n=== QUEUED TTS SAY MESSAGES ===")
    print(said_messages)
    print("\n=== CURRENT SESSION AGENT ===")
    print(type(mock_session.current_agent).__name__)

if __name__ == '__main__':
    asyncio.run(main())
