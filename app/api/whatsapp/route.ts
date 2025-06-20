import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// TODO: Replace this with real WhatsApp API integration (e.g., Twilio, Infobip)
async function sendWhatsAppMessage({ number, message, type, template, language, components }: {
  number: string,
  message?: string,
  type?: string,
  template?: string,
  language?: string,
  components?: any[]
}) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WhatsApp API credentials not set');
  }
  const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  let payload: {
    messaging_product: string;
    to: string;
    type: string;
    text?: { body: string };
    template?: { name: string; language: { code: string } };
    components?: any[];
  };
  if (type === 'text' && message) {
    payload = {
      messaging_product: 'whatsapp',
      to: number.replace(/[^\d]/g, ''),
      type: 'text',
      text: { body: message },
    };
  } else {
    // Default to template message
    payload = {
      messaging_product: 'whatsapp',
      to: number.replace(/[^\d]/g, ''),
      type: 'template',
      template: {
        name: template || 'hello_world',
        language: { code: language || 'en_US' }
      },
    };
    if (components && Array.isArray(components)) {
      payload.components = components;
    }
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Failed to send WhatsApp message');
  }
  return data;
}

export async function POST(request: NextRequest) {
  try {
    const { number, name, message, type, template, language, components } = await request.json();
    if (!number) {
      return NextResponse.json({ error: 'Missing number' }, { status: 400 });
    }
    let status = 'sent';
    let response: any = null;
    try {
      response = await sendWhatsAppMessage({ number, message, type, template, language, components });
      console.log('[WhatsApp] API response:', JSON.stringify(response, null, 2));
    } catch (err: any) {
      status = 'failed';
      response = { error: err.message };
    }
    // Store request in Supabase
    await supabase.from('whatsapp_requests').insert([
      {
        number,
        name,
        message,
        status,
        response,
        type: type || (template ? 'template' : 'text'),
        template: template || (type !== 'text' ? 'hello_world' : null),
        language: language || (type !== 'text' ? 'en_US' : null),
        components,
      },
    ]);
    // Log status to terminal
    if (status === 'sent') {
      console.log(`[WhatsApp] Sent to ${number}: status=${status}`);
    } else {
      console.error(`[WhatsApp] Failed to send to ${number}: status=${status}, error=${response?.error}`);
    }
    if (status === 'failed') {
      return NextResponse.json({ error: response.error || 'Failed to send WhatsApp message' }, { status: 500 });
    }
    return NextResponse.json({ success: true, response });
  } catch (error: any) {
    console.error('WhatsApp API error:', error);
    return NextResponse.json({ error: error.message || 'Failed to send WhatsApp message' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Only return history if ?history=1 is set
  const { searchParams } = new URL(request.url)
  if (searchParams.get('history') !== '1') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const { data, error } = await supabase
    .from('whatsapp_requests')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ requests: data })
} 