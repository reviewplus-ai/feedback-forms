import { NextRequest, NextResponse } from 'next/server';

// POST: Handle incoming webhook events
export async function POST(request: NextRequest) {
  const body = await request.json();
  console.log('WhatsApp Webhook Event:', JSON.stringify(body, null, 2));
  // You can process and store the event here if needed
  return NextResponse.json({ received: true });
}

// GET: Webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
} 