import sys
import json
from pathlib import Path

# Add backend/src directory to sys.path
src_dir = Path(__file__).parent
if str(src_dir) not in sys.path:
    sys.path.insert(0, str(src_dir))

import db

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No command specified"}))
        return

    cmd = sys.argv[1]
    payload_raw = sys.argv[2] if len(sys.argv) > 2 else "{}"
    try:
        payload = json.loads(payload_raw) if payload_raw else {}
    except Exception:
        payload = {}

    if cmd == "metrics":
        metrics = db.get_call_metrics()
        recent_calls = db.list_call_records(50)
        print(json.dumps({"success": True, "metrics": metrics, "recent_calls": recent_calls}))
    elif cmd == "record_simulated_call":
        call_id = payload.get("call_id")
        caller_name = payload.get("caller_name", "Test Caller")
        call_type = payload.get("call_type", "browser")
        status = payload.get("status", "SUCCESS")
        outcome_reason = payload.get("outcome_reason", "Verified information provided")
        duration = payload.get("duration_seconds", 45)
        rec = db.save_call_record(
            call_id=call_id,
            caller_name=caller_name,
            call_type=call_type,
            status=status,
            outcome_reason=outcome_reason,
            duration_seconds=duration,
        )
        print(json.dumps({"success": True, "call_record": rec}))
    elif cmd == "list":
        status_filter = payload.get("status", "")
        res = db.list_all_escalations(status_filter)
        print(json.dumps({"success": True, "tickets": res}))
    elif cmd == "resolve":
        ticket_id = payload.get("ticket_id")
        notes = payload.get("resolution_notes", "Resolved from Emergency Dashboard")
        res = db.update_escalation_status(ticket_id, "RESOLVED", notes)
        try:
            import outbound_call, asyncio
            asyncio.run(outbound_call.trigger_resolution_callback(
                ticket_id=ticket_id,
                caller_name=res.get("caller_name", "") if isinstance(res, dict) else "",
                location=res.get("location", "") if isinstance(res, dict) else "",
                resolution_notes=notes
            ))
        except Exception as e:
            pass
        print(json.dumps({"success": True, "ticket": res}))
    elif cmd in ("reset", "clear", "clear_all_data"):
        db.clear_all_data()
        print(json.dumps({"success": True, "message": "All call history and records cleared."}))
    else:
        print(json.dumps({"success": False, "error": f"Unknown command: {cmd}"}))

if __name__ == "__main__":
    main()
