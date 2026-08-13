import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execFileAsync = promisify(execFile);

export const revalidate = 0;

let escalationsCache: { timestamp: number; key: string; data: any } | null = null;
const CACHE_TTL_MS = 2000;

function getPythonExecutable(backendDir: string): string {
  const venvWin = path.join(backendDir, '.venv', 'Scripts', 'python.exe');
  if (fs.existsSync(venvWin)) return venvWin;

  const venvUnix = path.join(backendDir, '.venv', 'bin', 'python');
  if (fs.existsSync(venvUnix)) return venvUnix;

  return 'python';
}

// Helper to run Python script asynchronously
async function runPyDbCommand(commandType: string, payload: any = {}) {
  const now = Date.now();
  const cacheKey = `${commandType}:${JSON.stringify(payload)}`;
  if (escalationsCache && escalationsCache.key === cacheKey && now - escalationsCache.timestamp < CACHE_TTL_MS) {
    return escalationsCache.data;
  }

  try {
    const backendDir = path.resolve(process.cwd(), '..', 'backend');
    const pyExe = getPythonExecutable(backendDir);
    const cliScript = path.join(backendDir, 'src', 'db_cli.py');

    const { stdout } = await execFileAsync(pyExe, [cliScript, commandType, JSON.stringify(payload)], {
      encoding: 'utf-8',
      cwd: backendDir,
      timeout: 10000,
    });
    const result = JSON.parse(stdout.trim());

    if (commandType === 'list' && result.success) {
      escalationsCache = { timestamp: Date.now(), key: cacheKey, data: result };
    }

    return result;
  } catch (err: any) {
    console.error('Error running Python DB script:', err?.stdout || err?.message);
    return { success: false, tickets: [], error: String(err) };
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const result = await runPyDbCommand('list', { status });
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    escalationsCache = null; // Invalidate cache on status updates
    const { action, ticket_id, resolution_notes } = body;
    if (action === 'resolve' && ticket_id) {
      const result = await runPyDbCommand('resolve', { ticket_id, resolution_notes });
      return NextResponse.json(result);
    }
    return NextResponse.json({ success: false, error: 'Invalid action or missing ticket_id' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


