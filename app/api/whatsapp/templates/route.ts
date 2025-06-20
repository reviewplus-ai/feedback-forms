import { NextRequest, NextResponse } from 'next/server';

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WABA_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const GRAPH_API_VERSION = 'v19.0';

// GET: Fetch all templates
export async function GET() {
  if (!WHATSAPP_TOKEN || !WABA_ID) {
    return NextResponse.json({ error: 'Missing WhatsApp credentials' }, { status: 500 });
  }
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${WABA_ID}/message_templates?access_token=${WHATSAPP_TOKEN}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data.error?.message || 'Failed to fetch templates' }, { status: 500 });
  }
  return NextResponse.json({ templates: data.data });
}

// POST: Create a new template
export async function POST(request: NextRequest) {
  if (!WHATSAPP_TOKEN || !WABA_ID) {
    return NextResponse.json({ error: 'Missing WhatsApp credentials' }, { status: 500 });
  }
  const body = await request.json();
  // Validate template name: lowercase, underscores, no spaces or special chars
  if (!/^[a-z0-9_]+$/.test(body.name)) {
    return NextResponse.json({ error: 'Template name must be lowercase, use only letters, numbers, and underscores (no spaces or special characters).' }, { status: 400 });
  }
  // Ensure header has format: 'TEXT' if present
  if (Array.isArray(body.components)) {
    body.components = body.components.map((c: any) => {
      if (c.type === 'HEADER' && !c.format) {
        return { ...c, format: 'TEXT' };
      }
      return c;
    });
  }
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${WABA_ID}/message_templates?access_token=${WHATSAPP_TOKEN}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    return NextResponse.json({ error: data.error?.message || 'Failed to create template' }, { status: 500 });
  }
  return NextResponse.json({ template: data });
} 