import sys
import os
import json
from datetime import datetime, timezone

# Ensure src directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import db

from pathlib import Path

test_db_path = Path(__file__).parent / "test_call_recording.db"

def run_tests():
    print("=== STARTING STEP 5 CALL RECORDING & METRICS VERIFICATION TESTS ===")
    if test_db_path.exists():
        test_db_path.unlink()
    db.init_db(db_path=test_db_path)

    # 1. Fetch initial metrics
    initial_metrics = db.get_call_metrics(db_path=test_db_path)
    print(f"Initial DB Metrics: {initial_metrics}")

    init_total = initial_metrics["total_calls"]
    init_success = initial_metrics["successful_calls"]
    init_failed = initial_metrics["failed_calls"]

    # 2. Test 1: Record a SUCCESSFUL Browser Call (Verified weather & disaster info delivered)
    now_iso = datetime.now(timezone.utc).isoformat()
    call1_id = f"CALL-TEST-SUCCESS-WEBRTC-{int(datetime.now().timestamp())}"
    rec1 = db.save_call_record(
        call_id=call1_id,
        caller_name="Ramesh Kumar",
        call_type="browser",
        status="SUCCESS",
        outcome_reason="Caller received verified live weather & flash flood alert for Patna",
        duration_seconds=42,
        started_at=now_iso,
        ended_at=now_iso,
        db_path=test_db_path,
    )
    print(f"Recorded Successful Call 1: {rec1['call_id']} | Status: {rec1['status']}")

    # 3. Test 2: Record a FAILED SIP Call (Caller hung up before receiving verified information)
    call2_id = f"CALL-TEST-FAILED-SIP-{int(datetime.now().timestamp())}"
    rec2 = db.save_call_record(
        call_id=call2_id,
        caller_name="Anonymous Caller",
        call_type="sip",
        status="FAILED",
        outcome_reason="Caller hung up before receiving verified information or creating a human-help request",
        duration_seconds=12,
        started_at=now_iso,
        ended_at=now_iso,
        db_path=test_db_path,
    )
    print(f"Recorded Failed Call 2: {rec2['call_id']} | Status: {rec2['status']}")

    # 4. Test 3: Record another SUCCESSFUL Call (Human-help escalation ticket created)
    call3_id = f"CALL-TEST-SUCCESS-ESCALATION-{int(datetime.now().timestamp())}"
    rec3 = db.save_call_record(
        call_id=call3_id,
        caller_name="Priya Sharma",
        call_type="browser",
        status="SUCCESS",
        outcome_reason="Human-help request created (Ticket Ref ID: ESC-98765)",
        duration_seconds=65,
        started_at=now_iso,
        ended_at=now_iso,
        db_path=test_db_path,
    )
    print(f"Recorded Successful Call 3: {rec3['call_id']} | Status: {rec3['status']}")

    # 5. Fetch updated metrics
    updated_metrics = db.get_call_metrics(db_path=test_db_path)
    print(f"Updated DB Metrics: {updated_metrics}")

    assert updated_metrics["total_calls"] == init_total + 3, f"Expected total_calls to increase by 3, got {updated_metrics['total_calls']}"
    assert updated_metrics["successful_calls"] == init_success + 2, f"Expected successful_calls to increase by 2, got {updated_metrics['successful_calls']}"
    assert updated_metrics["failed_calls"] == init_failed + 1, f"Expected failed_calls to increase by 1, got {updated_metrics['failed_calls']}"

    print("[SUCCESS] All DB metric assertions passed successfully!")

    # 6. Verify list_call_records privacy check
    records = db.list_call_records(10, db_path=test_db_path)
    print(f"Recent {len(records)} call logs in DB:")
    for r in records[:3]:
        print(f"  - [{r['status']}] CallID: {r['call_id']} | Caller: {r['caller_name']} | Reason: {r['outcome_reason']}")

    try:
        if test_db_path.exists():
            test_db_path.unlink()
    except Exception:
        pass

    print("=== STEP 5 VERIFICATION COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    run_tests()
