import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

// Function to validate authentication
async function validateAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Authentication required' };
  }

  const token = authHeader.substring(7);
  
  // Create a client with the user's token
  const userSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );

  const { data: { user }, error } = await userSupabase.auth.getUser();
  if (error || !user) {
    return { error: 'Invalid authentication token' };
  }

  return { user };
}

// Function to get custom template by trigger
async function getTemplateByTrigger(trigger: string) {
  const { data, error } = await supabase
    .from('custom_templates')
    .select('*')
    .eq('automation_trigger', trigger)
    .single();

  if (error || !data) {
    throw new Error(`No template found for trigger '${trigger}'`);
  }

  return data;
}

// Function to replace variables in template text
function replaceTemplateVariables(text: string, variables: { [key: string]: string }) {
  let result = text;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  });
  return result;
}

// Function to build message from custom template
function buildCustomTemplateMessage(template: any, variables: { [key: string]: string }) {
  let message = '';

  // Add header if present
  if (template.header) {
    message += replaceTemplateVariables(template.header, variables) + '\n\n';
  }

  // Add body
  message += replaceTemplateVariables(template.body, variables);

  // Add footer if present
  if (template.footer) {
    message += '\n\n' + replaceTemplateVariables(template.footer, variables);
  }

  // Add button URLs if present
  if (template.buttons && Array.isArray(template.buttons)) {
    message += '\n\n';
    template.buttons.forEach((btn: any, index: number) => {
      if (btn.text && btn.url) {
        const url = replaceTemplateVariables(btn.url, variables);
        message += `${btn.text}: ${url}\n`;
      }
    });
  }

  return message.trim();
}

// Function to send WhatsApp message
async function sendWhatsAppMessage(number: string, messageText: string) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('WhatsApp API credentials not set');
  }

  const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to: number.replace(/[^\d]/g, ''),
    type: 'text',
    text: { body: messageText },
  };

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

// POST: Trigger automated survey
export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const authResult = await validateAuth(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { trigger, number, variables, customer_name, customer_email } = await request.json();
    
    if (!trigger || !number) {
      return NextResponse.json({ error: 'Trigger and number are required' }, { status: 400 });
    }

    // Get template by trigger
    const template = await getTemplateByTrigger(trigger);
    
    // Prepare variables
    const templateVars = {
      customer_name: customer_name || 'Customer',
      customer_email: customer_email || '',
      ...variables
    };

    // Build message
    const messageText = buildCustomTemplateMessage(template, templateVars);
    
    // Send message
    const response = await sendWhatsAppMessage(number, messageText);
    
    // Store in database
    await supabase.from('whatsapp_requests').insert([
      {
        number,
        name: customer_name,
        message: messageText,
        status: 'sent',
        response,
        type: 'automated_survey',
        template: template.name,
        custom_template: true,
        automation_trigger: trigger,
      },
    ]);

    console.log(`[Automation] Triggered survey for ${trigger} to ${number}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Automated survey sent successfully',
      template: template.name,
      trigger 
    });
  } catch (error: any) {
    console.error('Automation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to trigger automated survey' }, { status: 500 });
  }
}

// GET: List available triggers
export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const authResult = await validateAuth(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('custom_templates')
      .select('automation_trigger, name, description')
      .not('automation_trigger', 'is', null)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const triggers = data.map(template => ({
      trigger: template.automation_trigger,
      template_name: template.name,
      description: template.description
    }));

    return NextResponse.json({ triggers });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 