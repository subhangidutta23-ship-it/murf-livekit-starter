import { NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execFileAsync = promisify(execFile);

export const revalidate = 0;

// In-memory cache to prevent server event-loop freezing during polling
let metricsCache: { timestamp: number; data: any } | null = null;
const CACHE_TTL_MS = 2000;

function getPythonExecutable(backendDir: string): string {
  const venvWin = path.join(backendDir, '.venv', 'Scripts', 'python.exe');
  if (fs.existsSync(venvWin)) return venvWin;

  const venvUnix = path.join(backendDir, '.venv', 'bin', 'python');
  if (fs.existsSync(venvUnix)) return venvUnix;

  return 'python';
}

async function runPyDashboardCommand(cmdType: string, payload: any = {}) {
  const now = Date.now();
  if (cmdType === 'metrics' && metricsCache && now - metricsCache.timestamp < CACHE_TTL_MS) {
    return metricsCache.data;
  }

  try {
    const backendDir = path.resolve(process.cwd(), '..', 'backend');
    const pyExe = getPythonExecutable(backendDir);
    const cliScript = path.join(backendDir, 'src', 'db_cli.py');

    const { stdout } = await execFileAsync(pyExe, [cliScript, cmdType, JSON.stringify(payload)], {
      encoding: 'utf-8',
      cwd: backendDir,
      timeout: 10000,
    });
    const result = JSON.parse(stdout.trim());

    if (cmdType === 'metrics' && result.success) {
      metricsCache = { timestamp: Date.now(), data: result };
    }

    return result;
  } catch (err: any) {
    console.error('Error running Python DB dashboard command:', err?.stdout || err?.message);
    return {
      success: false,
      metrics: { total_calls: 0, successful_calls: 0, failed_calls: 0, success_rate: 0.0 },
      recent_calls: [],
      error: String(err),
    };
  }
}

export async function GET() {
  const result = await runPyDashboardCommand('metrics');
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    metricsCache = null; // Invalidate cache on reset/updates
    if (body.action === 'reset' || body.action === 'clear') {
      const result = await runPyDashboardCommand('reset');
      return NextResponse.json(result);
    }
    const result = await runPyDashboardCommand('record_simulated_call', body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}


