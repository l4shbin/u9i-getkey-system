import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { sessionToken } = await request.json();
    if (!sessionToken) return NextResponse.json({ error: 'Invalid Session' }, { status: 400 });

    const session = await kv.get(sessionToken);
    if (!session) return NextResponse.json({ error: 'Session Expired' }, { status: 400 });

    session.taskStartedAt = Date.now();
    await kv.set(sessionToken, session, { ex: 900 });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
