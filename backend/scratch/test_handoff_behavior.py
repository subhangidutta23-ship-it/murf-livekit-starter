import asyncio
import sys
import os

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "src"))
sys.path.insert(0, src_dir)

from agent import Assistant, ShelterInformationSpecialist, disaster_data
from unittest.mock import MagicMock

async def test_handoff():
    said_messages = []
    
    class MockSession:
        def __init__(self):
            self.current_agent = None
        def update_agent(self, agent):
            self.current_agent = agent
        async def say(self, text, **kwargs):
            said_messages.append(text)
            
    session = MockSession()
    assistant = Assistant(call_context={"facts": {"location": "Patna"}, "call_type": "browser"})
    session.current_agent = assistant
    
    mock_run_ctx = MagicMock()
    mock_run_ctx.session = session
    
    result = await assistant.transfer_to_shelter_specialist(mock_run_ctx, location="Patna")
    print("Tool returned:", result[:60] + "...")
    print("Session current agent:", type(session.current_agent).__name__)
    print("Said messages count:", len(said_messages))
    if len(said_messages) > 0:
        print("Said message snippet:", said_messages[0][:60] + "...")

if __name__ == "__main__":
    asyncio.run(test_handoff())
