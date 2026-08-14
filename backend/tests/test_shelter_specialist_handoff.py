import sys
import os
import asyncio
import pytest

# Ensure backend/src is in sys.path
src_dir = os.path.join(os.path.dirname(__file__), "..", "src")
sys.path.insert(0, src_dir)

import db
import disaster_data
from agent import Assistant, ShelterInformationSpecialist

class MockAgentSession:
    def __init__(self, initial_agent):
        self.current_agent = initial_agent
        self.history = []

    def update_agent(self, agent):
        self.current_agent = agent

class MockRunContext:
    def __init__(self, session=None):
        self.session = session

@pytest.mark.asyncio
async def test_shelter_specialist_handoff_both_paths():
    """
    Test Step 6: Test both normal question (main agent) and specialist question (handoff).
    """
    db.init_db()
    
    main_agent = Assistant()
    session = MockAgentSession(initial_agent=main_agent)
    ctx = MockRunContext(session=session)

    # ------------------------------------------------------------------
    # PATH 1: NORMAL QUESTION (Main Agent Answers directly, NO Handoff)
    # ------------------------------------------------------------------
    print("\n--- PATH 1: Normal Question (Main Agent Handles Directly) ---")
    query_1 = "What is the current flood alert status in Patna?"
    print(f"User Question: '{query_1}'")
    
    # Store message in session history
    session.history.append({"role": "user", "content": query_1})
    
    normal_response = await main_agent.get_disaster_alerts(ctx, location="Patna")
    print(f"Main Agent Direct Response: {normal_response}")
    
    assert session.current_agent == main_agent, "FAIL: Main agent handed off on a normal question!"
    assert "Patna" in normal_response
    assert "Alert" in normal_response
    print("✅ PATH 1 PASSED: Normal question answered directly by main agent. No handoff occurred.")

    # ------------------------------------------------------------------
    # PATH 2: SPECIALIST QUESTION (Main Agent Hands Off to Specialist)
    # ------------------------------------------------------------------
    print("\n--- PATH 2: Specialist Question (Shelter Information Required) ---")
    query_2 = "Where is the nearest emergency shelter in Patna, what is its available capacity, and are domestic pets allowed?"
    print(f"User Question: '{query_2}'")
    
    # Append second question to ongoing conversation history (Step 4: context preserved)
    session.history.append({"role": "user", "content": query_2})
    
    # Main agent executes handoff tool
    handoff_response = await main_agent.transfer_to_shelter_specialist(
        ctx,
        reason="User requested emergency shelter locations, capacity, and pet policy details"
    )
    print(f"Main Agent Handoff Statement & Introduction: {handoff_response}")
    
    # Step 3 & 4 Verification: Check session active agent changed to ShelterInformationSpecialist
    assert isinstance(session.current_agent, ShelterInformationSpecialist), "FAIL: Handoff did not switch session agent to ShelterInformationSpecialist!"
    specialist_agent = session.current_agent
    
    # Step 5 Verification: Main agent said connection statement & specialist introduced itself
    assert "I will connect you to our shelter information specialist" in handoff_response
    assert "Shelter Information Specialist" in handoff_response
    
    # Step 4 Verification: Specialist accesses ongoing conversation history
    assert len(session.history) == 2, "FAIL: Conversation history was not preserved across handoff!"
    
    # Specialist answers the shelter details and pet policy using specialist tools
    shelter_info = await specialist_agent.get_shelter_details(ctx, location="Patna")
    pet_policy = await specialist_agent.check_shelter_pet_and_medical_policy(ctx, location="Patna")
    
    print(f"Specialist Shelter Details Response: {shelter_info}")
    print(f"Specialist Pet & Medical Policy Response: {pet_policy}")
    
    assert "Patna" in shelter_info
    assert "capacity" in shelter_info.lower() or "shelter" in shelter_info.lower()
    assert "pet" in pet_policy.lower() or "domestic pets" in pet_policy.lower()
    print("✅ PATH 2 PASSED: Main agent transferred conversation, specialist introduced itself, preserved history, and answered shelter query.")

if __name__ == "__main__":
    asyncio.run(test_shelter_specialist_handoff_both_paths())
