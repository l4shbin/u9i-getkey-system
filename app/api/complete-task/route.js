import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { taskNumber, sessionToken } = await request.json();
    if (!sessionToken) return NextResponse.json({ error: 'Invalid Session' }, { status: 400 });

    const session = await kv.get(sessionToken);
    if (!session) return NextResponse.json({ error: 'Session Expired' }, { status: 400 });

    if (!session.taskStartedAt) {
      return NextResponse.json({ error: 'Task never started' }, { status: 400 });
    }

    const timeElapsed = (Date.now() - session.taskStartedAt) / 1000;
    if (timeElapsed < 20) {
      return NextResponse.json({ error: 'Bypass Detected: Timer skipped' }, { status: 403 });
    }

    if (taskNumber === 1) session.t1 = true;
    if (taskNumber === 2 && session.t1) session.t2 = true;
    if (taskNumber === 3 && session.t2) session.t3 = true;

    session.taskStartedAt = null;
    await kv.set(sessionToken, session, { ex: 900 });

    return NextResponse.json({ success: true, progress: session });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
        }
