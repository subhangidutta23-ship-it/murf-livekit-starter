import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import path from 'path';

export const revalidate = 0;

// Helper to run Python script to query or update DB
function runPyDbCommand(commandType: string, payload: any = {}) {
  try {
    const backendDir = path.resolve(process.cwd(), '..', 'backend');
    const pyExe = path.join(backendDir, '.venv', 'Scripts', 'python.exe');
    
    const pyScript = `
import sys, json, os
sys.path.insert(0, r"${path.join(backendDir, 'src')}")
import db

cmd = r"${commandType}"
payload_str = r'''${JSON.stringify(payload)}'''
payload = json.loads(payload_str) if payload_str else {}

if cmd == "list":
    status_filter = payload.get("status", "")
    res = db.list_all_escalations(status_filter)
    print(json.dumps({"success": True, "tickets": res}))
elif cmd == "resolve":
    ticket_id = payload.get("ticket_id")
    notes = payload.get("resolution_notes", "Resolved from Emergency Dashboard")
    res = db.update_escalation_status(ticket_id, "RESOLVED", notes)
    import outbound_call, asyncio
    asyncio.run(outbound_call.trigger_resolution_callback(ticket_id=ticket_id, caller_name=res.get("caller_name",""), location=res.get("location",""), resolution_notes=notes))
    print(json.dumps({"success": True, "ticket": res}))
else:
    print(json.dumps({"success": False, "error": "Unknown command"}))
`;

    const output = execSync(`"${pyExe}" -c "${pyScript.replace(/"/g, '\\"')}"`, {
      encoding: 'utf-8',
      cwd: backendDir,
      timeout: 10000,
    });
    return JSON.parse(output.trim());
  } catch (err: any) {
    console.error('Error running Python DB script:', err?.stdout || err?.message);
    return { success: false, tickets: [], error: String(err) };
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const result = runPyDbCommand('list', { status });
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, ticket_id, resolution_notes } = body;
    if (action === 'resolve' && ticket_id) {
      const result = runPyDbCommand('resolve', { ticket_id, resolution_notes });
      return NextResponse.json(result);
    }
    return NextResponse.json({ success: false, error: 'Invalid action or missing ticket_id' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
