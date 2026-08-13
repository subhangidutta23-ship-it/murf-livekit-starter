import sys
import os
import asyncio

# Ensure backend/src is in sys.path
src_dir = os.path.join(os.path.dirname(__file__), "..", "src")
sys.path.insert(0, src_dir)

import db
import disaster_data
from agent import Assistant

class MockRunContext:
    pass

from pathlib import Path

test_db_path = Path(__file__).parent / "test_both_paths.db"

async def run_both_paths_test():
    print("================================================================")
    print("STEP 7 TEST: TESTING NORMAL CONVERSATION VS HUMAN ESCALATION")
    print("================================================================")

    db.init_db()
    assistant = Assistant()
    ctx = MockRunContext()

    # Initial count of tickets in database
    initial_tickets = db.list_all_escalations()
    initial_count = len(initial_tickets)

    # ------------------------------------------------------------------
    # PATH 1: NORMAL CONVERSATION (Does NOT need human help)
    # ------------------------------------------------------------------
    print("\n--- PATH 1: Normal Conversation (Information Query) ---")
    query_location = "Patna"
    print(f"Caller User Input: 'What is the flood alert level in {query_location}?'")
    
    alert_response = await assistant.get_disaster_alerts(ctx, location=query_location)
    print(f"Agent Response: {alert_response}")
    
    # Verify no escalation request was created
    tickets_after_path1 = db.list_all_escalations()
    assert len(tickets_after_path1) == initial_count, "FAIL: Normal conversation generated unexpected ticket!"
    print("✅ PATH 1 PASSED: Normal conversation answered cleanly without creating escalation ticket.")

    # ------------------------------------------------------------------
    # PATH 2: HUMAN HELP NEEDED WITH EXPLICIT CONSENT (Step 4, 5, 6)
    # ------------------------------------------------------------------
    print("\n--- PATH 2: Emergency Assistance Needed WITH Explicit Consent ---")
    import time
    timestamp_id = int(time.time())
    caller_name = f"Subhangi Dutta {timestamp_id}"
    user_id = f"subhangi_dutta_{timestamp_id}"
    location = "Patna Kankarbagh"
    issue = "Trapped in floodwaters with injured ankle"
    raw_summary = "Water on 1st floor. Phone: +91-9876543210, Email: subhangi@example.com."
    
    print(f"Caller User Input: 'I am trapped on the 1st floor with an injured ankle! My phone is +91-9876543210.'")
    print(f"Agent Action (Step 4): Telling caller info to be sent and asking permission...")
    
    # Caller grants permission
    escalation_res = await assistant.create_escalation(
        ctx,
        caller_name=caller_name,
        issue_type=issue,
        summary=raw_summary,
        urgency_level="EMERGENCY",
        location=location,
        preferred_contact="Phone Call",
        permission_granted=True,
    )
    print(f"Agent Response (Step 6): {escalation_res}")
    
    assert "SUCCESS" in escalation_res or "UPDATED" in escalation_res
    assert "ESC-" in escalation_res
    
    # Verify ticket stored in DB with PII redacted and urgency EMERGENCY
    tickets_after_path2 = db.list_all_escalations()
    assert len(tickets_after_path2) == initial_count + 1
    
    latest_ticket = tickets_after_path2[0]
    print(f"Verified Database Entry (Step 5): Ref={latest_ticket['ticket_id']}, Name={latest_ticket['caller_name']}, Urgency={latest_ticket['urgency_level']}, Status={latest_ticket['status']}")
    print(f"Sanitized Summary: {latest_ticket['summary']}")
    
    assert latest_ticket["urgency_level"] == "EMERGENCY"
    assert "+91-9876543210" not in latest_ticket["summary"]
    assert "[REDACTED_PHONE]" in latest_ticket["summary"]
    assert "[REDACTED_EMAIL]" in latest_ticket["summary"]
    print("✅ PATH 2 PASSED: Emergency request created with consent, PII redacted, stored in DB/Dashboard, and next steps provided.")

    # ------------------------------------------------------------------
    # PATH 3: HUMAN HELP NEEDED BUT PERMISSION DENIED (Step 4 Refusal)
    # ------------------------------------------------------------------
    print("\n--- PATH 3: Emergency Assistance Needed BUT Consent Denied ---")
    caller_denied_name = "Anonymous User"
    
    print(f"Caller User Input: 'Help! My roof collapsed, but I do NOT want my details saved.'")
    
    denied_res = await assistant.create_escalation(
        ctx,
        caller_name=caller_denied_name,
        issue_type="Roof Collapse",
        summary="Roof collapsed in heavy rain.",
        urgency_level="HIGH",
        location="Delhi",
        permission_granted=False,
    )
    print(f"Agent Response: {denied_res}")
    
    assert "CANCELLED" in denied_res
    tickets_after_path3 = db.list_all_escalations()
    assert len(tickets_after_path3) == initial_count + 1, "FAIL: Ticket created despite permission refusal!"
    print("✅ PATH 3 PASSED: Permission refusal respected, no escalation ticket created.")

    print("\n================================================================")
    print("🎉 ALL STEPS 4, 5, 6, AND 7 PATH TESTS PASSED PERFECTLY!")
    print("================================================================")

if __name__ == "__main__":
    asyncio.run(run_both_paths_test())
