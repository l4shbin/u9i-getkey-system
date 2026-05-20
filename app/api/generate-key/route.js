import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

function generatePremiumKey() {
  const prefix = "FREE9UI_";
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";
  const remainingLength = 20 - prefix.length - 1; 
  
  let randomString = "";
  for (let i = 0; i < remainingLength; i++) {
    randomString += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}${randomString})`;
}

export async function POST(request) {
  try {
    const { sessionToken } = await request.json();
    const session = await kv.get(sessionToken);
    
    if (!session || !session.t1 || !session.t2 || !session.t3) {
      return NextResponse.json({ error: 'Security Breach Detected' }, { status: 400 });
    }

    const finalKey = generatePremiumKey();
    await kv.del(sessionToken); 
    await kv.set(`u9i_key:${finalKey}`, { owner: session.userId }, { ex: 7200 });

    return NextResponse.json({ success: true, key: finalKey });
  } catch (error) {
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
