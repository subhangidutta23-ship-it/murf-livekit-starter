import sys
import os
import asyncio

# Ensure backend/src is in sys.path
src_dir = os.path.join(os.path.dirname(__file__), "..", "src")
sys.path.insert(0, src_dir)

import db
import outbound_call

def test_pii_sanitization():
    print("--- Test 1: PII Sanitization ---")
    raw_summary = "Caller John Doe (phone: +1-555-019-2831, ssn: 123-45-6789, email: john@example.com, pin: 1234) is trapped on 2nd floor during flooding."
    sanitized = db.sanitize_summary(raw_summary)
    print(f"Original : {raw_summary}")
    print(f"Sanitized: {sanitized}")
    assert "+1-555-019-2831" not in sanitized
    assert "john@example.com" not in sanitized
    assert "123-45-6789" not in sanitized
    assert "[REDACTED_PHONE]" in sanitized
    assert "[REDACTED_EMAIL]" in sanitized
    assert "[REDACTED_SSN]" in sanitized
    print("✅ PII Sanitization passed!\n")

def test_escalation_lifecycle():
    print("--- Test 2: Escalation Creation & Urgency Levels ---")
    caller_name = "Aarav Sharma"
    user_id = "aarav_sharma"
    location = "Patna Sector 4"
    
    # 1. Create Initial Escalation (HIGH urgency)
    ticket1 = db.save_escalation_request(
        user_id=user_id,
        caller_name=caller_name,
        issue_type="Trapped in Floodwaters",
        summary="Water level reaching 1st floor. Call +91-9876543210 for emergency.",
        urgency_level="HIGH",
        location=location,
    )
    print(f"Created Ticket 1: ID={ticket1['ticket_id']}, Status={ticket1['status']}, Urgency={ticket1['urgency_level']}, Updated={ticket1['is_updated']}")
    assert ticket1["is_updated"] == False
    assert ticket1["urgency_level"] == "HIGH"
    assert "[REDACTED_PHONE]" in ticket1["summary"]
    
    ticket_id = ticket1["ticket_id"]

    # 2. Duplicate Request (EMERGENCY urgency) - Should UPDATE existing ticket
    print("\n--- Test 3: Stop Duplicate Requests & Elevate Urgency ---")
    ticket2 = db.save_escalation_request(
        user_id=user_id,
        caller_name=caller_name,
        issue_type="Trapped & Injured",
        summary="Leg injured by debris, water rising fast.",
        urgency_level="EMERGENCY",
        location=location,
    )
    print(f"Updated Ticket 2: ID={ticket2['ticket_id']}, Status={ticket2['status']}, Urgency={ticket2['urgency_level']}, Updated={ticket2['is_updated']}")
    assert ticket2["ticket_id"] == ticket_id
    assert ticket2["is_updated"] == True
    assert ticket2["urgency_level"] == "EMERGENCY"
    assert "UPDATE:" in ticket2["summary"]
    print("✅ Duplicate prevention and urgency elevation passed!\n")

    # 3. Check Status
    print("--- Test 4: Show Request Status ---")
    fetched = db.get_escalation(ticket_id)
    print(f"Fetched Status for {ticket_id}: Status={fetched['status']}, Urgency={fetched['urgency_level']}")
    assert fetched["status"] == "OPEN"
    print("✅ Request status check passed!\n")

    # 4. Resolve Request & Trigger Resolution Callback
    print("--- Test 5: Resolution & Call Back After Resolution ---")
    resolved = db.update_escalation_status(ticket_id, new_status="RESOLVED", resolution_notes="Rescue team dispatched and caller safely evacuated.")
    print(f"Resolved Ticket: Status={resolved['status']}, Resolution Notes={resolved['resolution_notes']}")
    assert resolved["status"] == "RESOLVED"

    # Trigger resolution callback
    res_cb = asyncio.run(outbound_call.trigger_resolution_callback(
        ticket_id=ticket_id,
        caller_name=caller_name,
        location=location,
        resolution_notes=resolved["resolution_notes"],
    ))
    assert res_cb == True
    print("✅ Resolution and outbound callback passed!\n")

if __name__ == "__main__":
    db.init_db()
    test_pii_sanitization()
    test_escalation_lifecycle()
    print("🎉 ALL DAY 7 HUMAN ESCALATION TESTS PASSED!")
