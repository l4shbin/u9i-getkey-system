import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== 'U9I_SECURE_AUTH_KEY_2026') {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }

    const { userId } = await request.json();
    if (!userId) return NextResponse.json({ error: 'Missing Identity' }, { status: 400 });

    const sessionToken = 'U9I_' + Math.random().toString(36).substring(2, 15).toUpperCase();

    await kv.set(sessionToken, { 
      t1: false, t2: false, t3: false, 
      userId, 
      taskStartedAt: null 
    }, { ex: 900 });

    return NextResponse.json({ success: true, token: sessionToken });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
