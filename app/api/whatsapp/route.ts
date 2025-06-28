import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

// Add this helper at the top (after env vars)
function getWhatsAppLanguageCode(language: string | undefined): string {
  if (!language) return 'en_US';
  const map: Record<string, string> = {
    en: 'en_US',
    en_us: 'en_US',
    'en-us': 'en_US',
    en_US: 'en_US',
    es: 'es_ES', es_es: 'es_ES', 'es-es': 'es_ES', es_ES: 'es_ES',
    fr: 'fr_FR', fr_fr: 'fr_FR', 'fr-fr': 'fr_FR', fr_FR: 'fr_FR',
    de: 'de_DE', de_de: 'de_DE', 'de-de': 'de_DE', de_DE: 'de_DE',
    ar: 'ar_AR', ar_ar: 'ar_AR', 'ar-ar': 'ar_AR', ar_AR: 'ar_AR',
    pt: 'pt_BR', pt_br: 'pt_BR', 'pt-br': 'pt_BR', pt_BR: 'pt_BR',
    it: 'it_IT', it_it: 'it_IT', 'it-it': 'it_IT', it_IT: 'it_IT',
    ja: 'ja_JP', ja_jp: 'ja_JP', 'ja-jp': 'ja_JP', ja_JP: 'ja_JP',
    ko: 'ko_KR', ko_kr: 'ko_KR', 'ko-kr': 'ko_KR', ko_KR: 'ko_KR',
    zh: 'zh_CN', zh_cn: 'zh_CN', 'zh-cn': 'zh_CN', zh_CN: 'zh_CN',
    ru: 'ru_RU', ru_ru: 'ru_RU', 'ru-ru': 'ru_RU', ru_RU: 'ru_RU',
    tr: 'tr_TR', tr_tr: 'tr_TR', 'tr-tr': 'tr_TR', tr_TR: 'tr_TR',
    nl: 'nl_NL', nl_nl: 'nl_NL', 'nl-nl': 'nl_NL', nl_NL: 'nl_NL',
    pl: 'pl_PL', pl_pl: 'pl_PL', 'pl-pl': 'pl_PL', pl_PL: 'pl_PL',
    th: 'th_TH', th_th: 'th_TH', 'th-th': 'th_TH', th_TH: 'th_TH',
    vi: 'vi_VN', vi_vn: 'vi_VN', 'vi-vn': 'vi_VN', vi_VN: 'vi_VN',
    id: 'id_ID', id_id: 'id_ID', 'id-id': 'id_ID', id_ID: 'id_ID',
    ms: 'ms_MY', ms_my: 'ms_MY', 'ms-my': 'ms_MY', ms_MY: 'ms_MY',
    tl: 'tl_PH', tl_ph: 'tl_PH', 'tl-ph': 'tl_PH', tl_PH: 'tl_PH',
  };
  return map[language.toLowerCase()] || 'en_US';
}

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

// Function to check if template exists in WhatsApp Business API
async function checkTemplateExistsInWhatsApp(templateName: string, language: string = 'en_US') {
  if (!WHATSAPP_TOKEN || !WHATSAPP_BUSINESS_ACCOUNT_ID) {
    throw new Error('WhatsApp API credentials not set');
  }

  try {
    console.log(`🔍 Checking if template '${templateName}' exists in WhatsApp Business API for language: ${language}`);
    
    // Fetch all templates from WhatsApp Business API
    const url = `https://graph.facebook.com/v19.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      },
      // Add timeout to prevent long waits
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      console.error('❌ Failed to fetch templates from WhatsApp:', data);
      return false;
    }
    
    // Check if template exists and has the required language
    if (data.data && data.data.length > 0) {
      console.log(`📋 Found ${data.data.length} templates in WhatsApp Business API`);
      
      const template = data.data.find((t: any) => 
        t.name === templateName && 
        t.language === language
      );
      
      if (template) {
        console.log(`✅ Found template '${templateName}' in WhatsApp Business API:`, {
          name: template.name,
          language: template.language,
          status: template.status,
          category: template.category
        });
        return true;
      } else {
        console.log(`❌ Template '${templateName}' not found in WhatsApp Business API for language: ${language}`);
        console.log('Available templates with similar names:');
        data.data.forEach((t: any) => {
          if (t.name.includes(templateName) || templateName.includes(t.name)) {
            console.log(`  - ${t.name} (${t.language}) - ${t.status}`);
          }
        });
        return false;
      }
    }
    
    console.log('❌ No templates found in WhatsApp Business API');
    return false;
  } catch (error) {
    console.error('❌ Error checking template in WhatsApp:', error);
    
    // Check if it's a timeout or network error
    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        console.warn('⚠️ Timeout while checking template in Meta API - this is likely a network issue');
        throw new Error('Network timeout while checking template in Meta API');
      }
    }
    
    return false;
  }
}

// Function to get custom template from database
async function getCustomTemplate(templateName: string) {
  const { data, error } = await supabase
    .from('custom_templates')
    .select('*')
    .eq('name', templateName)
    .single();

  if (error || !data) {
    throw new Error(`Template '${templateName}' not found in database`);
  }

  console.log(`🔍 Validating template: ${templateName}`);

  // Check if whatsapp_template_name is missing
  if (!data.whatsapp_template_name) {
    console.log(`⚠️ Template '${templateName}' missing whatsapp_template_name`);
    
    // Try to fix it automatically
    try {
      const { error: updateError } = await supabase
        .from('custom_templates')
        .update({ 
          whatsapp_template_name: data.name,
          status: 'APPROVED',
          updated_at: new Date().toISOString()
        })
        .eq('id', data.id);

      if (updateError) {
        console.error(`❌ Failed to auto-fix template '${templateName}':`, updateError);
        throw new Error(`Template '${templateName}' is not properly configured for WhatsApp. Please use the "Fix Templates" button or recreate the template.`);
      } else {
        console.log(`✅ Auto-fixed template '${templateName}' with whatsapp_template_name: ${data.name}`);
        data.whatsapp_template_name = data.name;
        data.status = 'APPROVED';
      }
    } catch (fixError: any) {
      console.error(`❌ Auto-fix failed for template '${templateName}':`, fixError);
      throw new Error(`Template '${templateName}' is not properly configured for WhatsApp. Please use the "Fix Templates" button or recreate the template.`);
    }
  }

  // Validate template status
  console.log(`📊 Template status: ${data.status || 'NO_STATUS'}`);
  
  if (!data.status) {
    throw new Error(`Template '${templateName}' has no status. Please use the "Fix Templates" button to update it.`);
  }

  if (data.status === 'PENDING') {
    throw new Error(`Template '${templateName}' is pending approval by WhatsApp. Please wait for approval or check the Meta Business Manager.`);
  }

  if (data.status === 'REJECTED') {
    throw new Error(`Template '${templateName}' was rejected by WhatsApp. Please check the content and try again with different wording.`);
  }

  if (data.status !== 'APPROVED') {
    throw new Error(`Template '${templateName}' has invalid status: ${data.status}. Expected: APPROVED`);
  }

  // Check if template exists in WhatsApp Business API
  const whatsappLanguage = getWhatsAppLanguageCode(data.language);
  console.log(`🌐 Checking template with language mapping: ${data.language} -> ${whatsappLanguage}`);
  console.log(`🔍 Looking for template: '${data.whatsapp_template_name}' in language: '${whatsappLanguage}'`);
  
  try {
    const existsInWhatsApp = await checkTemplateExistsInWhatsApp(data.whatsapp_template_name, whatsappLanguage);
    
    if (!existsInWhatsApp) {
      console.error(`❌ Template '${data.whatsapp_template_name}' not found in WhatsApp Business API for language: ${whatsappLanguage}`);
      throw new Error(`Template '${data.whatsapp_template_name}' does not exist in your WhatsApp Business account for language ${whatsappLanguage}. Please check your Meta Business Manager or create the template there first.`);
    }
  } catch (error: any) {
    // If it's a network error, trust the local database status
    if (error.message.includes('ETIMEDOUT') || error.message.includes('fetch failed') || error.message.includes('network')) {
      console.warn(`⚠️ Network error checking template in Meta API: ${error.message}`);
      console.log(`✅ Trusting local database status: ${data.status} for template '${data.whatsapp_template_name}'`);
      
      if (data.status !== 'APPROVED') {
        throw new Error(`Template '${data.whatsapp_template_name}' has status '${data.status}' in local database. Please ensure it's APPROVED before sending.`);
      }
      
      console.log(`✅ Proceeding with template '${data.whatsapp_template_name}' based on local database status`);
    } else {
      // Re-throw other errors
      throw error;
    }
  }

  console.log(`✅ Template '${templateName}' validated successfully`);
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

// TODO: Replace this with real WhatsApp API integration (e.g., Twilio, Infobip)
async function sendWhatsAppMessage({ number, message, type, template, language, components, customTemplate }: {
  number: string,
  message?: string,
  type?: string,
  template?: string,
  language?: string,
  components?: any[],
  customTemplate?: boolean
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

  if (customTemplate && template) {
    // Get custom template from database to get WhatsApp template name
    const customTemplateData = await getCustomTemplate(template);
    
    if (!customTemplateData.whatsapp_template_name) {
      throw new Error(`Template '${template}' is not properly configured as a WhatsApp template`);
    }

    // Send as proper WhatsApp template message
    payload = {
      messaging_product: 'whatsapp',
      to: number.replace(/[^\d]/g, ''),
      type: 'template',
      template: {
        name: customTemplateData.whatsapp_template_name,
        language: { code: getWhatsAppLanguageCode(customTemplateData.language) }
      },
    };

    // Add components if variables are provided
    if (components && !Array.isArray(components) && Object.keys(components).length > 0) {
      const templateComponents: any[] = [];
      
      // Add header component if template has header and variables
      if (customTemplateData.header) {
        const headerText = replaceTemplateVariables(customTemplateData.header, components);
        templateComponents.push({
          type: 'HEADER',
          parameters: [{
            type: 'text',
            text: headerText
          }]
        });
      }
      
      // Add body component if template has variables
      if (customTemplateData.variables && customTemplateData.variables.length > 0) {
        const bodyParameters = customTemplateData.variables.map((variable: string) => ({
          type: 'text',
          text: components[variable] || `{{${variable}}}`
        }));
        
        templateComponents.push({
          type: 'BODY',
          parameters: bodyParameters
        });
      }
      
      // Add footer component if template has footer and variables
      if (customTemplateData.footer) {
        const footerText = replaceTemplateVariables(customTemplateData.footer, components);
        templateComponents.push({
          type: 'FOOTER',
          parameters: [{
            type: 'text',
            text: footerText
          }]
        });
      }
      
      // Add button components if template has buttons
      if (customTemplateData.buttons && customTemplateData.buttons.length > 0) {
        const buttonComponents = customTemplateData.buttons.map((btn: any, index: number) => {
          const url = replaceTemplateVariables(btn.url, components);
          return {
            type: 'BUTTON',
            sub_type: 'URL',
            index: index,
            parameters: [{
              type: 'text',
              text: url
            }]
          };
        });
        
        templateComponents.push(...buttonComponents);
      }
      
      if (templateComponents.length > 0) {
        payload.components = templateComponents;
      } else {
        // If there are no components, ensure the field is omitted
        delete payload.components;
      }
    } else {
      // If there are no variables/components, ensure the field is omitted
      delete payload.components;
    }
  } else if (type === 'text' && message) {
    payload = {
      messaging_product: 'whatsapp',
      to: number.replace(/[^\d]/g, ''),
      type: 'text',
      text: { body: message },
    };
  } else {
    // Default to Meta template message
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

  // Debug print the payload before sending
  console.log('WhatsApp API payload:', JSON.stringify(payload, null, 2));

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
    console.log('📤 WhatsApp message request received');
    
    // Validate authentication
    const authResult = await validateAuth(request);
    if (authResult.error) {
      console.error('❌ Authentication failed:', authResult.error);
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { number, name, message, type, template, language, components, customTemplate } = await request.json();
    
    console.log('📋 Request details:', {
      number,
      template,
      customTemplate,
      type,
      hasComponents: !!components
    });
    
    if (!number) {
      console.error('❌ Missing phone number');
      return NextResponse.json({ error: 'Missing phone number' }, { status: 400 });
    }

    let status = 'sent';
    let response: any = null;
    let errorMessage = '';
    
    try {
      console.log('🚀 Attempting to send WhatsApp message...');
      response = await sendWhatsAppMessage({ number, message, type, template, language, components, customTemplate });
      console.log('✅ WhatsApp API response:', JSON.stringify(response, null, 2));
    } catch (err: any) {
      status = 'failed';
      errorMessage = err.message;
      response = { error: err.message };
      console.error('❌ WhatsApp send failed:', err.message);
      
      // Provide more specific error messages based on the error
      if (err.message.includes('Template name does not exist')) {
        errorMessage = `Template '${template}' does not exist in your WhatsApp Business account. Please check your Meta Business Manager or create the template there first.`;
      } else if (err.message.includes('not properly configured')) {
        errorMessage = `Template '${template}' is not properly configured. Please use the "Fix Templates" button in the dashboard.`;
      } else if (err.message.includes('pending approval')) {
        errorMessage = `Template '${template}' is pending approval by WhatsApp. Please wait for approval or check the Meta Business Manager.`;
      } else if (err.message.includes('was rejected')) {
        errorMessage = `Template '${template}' was rejected by WhatsApp. Please check the content and try again with different wording.`;
      } else if (err.message.includes('does not exist in your WhatsApp Business account')) {
        errorMessage = err.message; // Already specific enough
      }
    }

    // Store request in Supabase
    try {
      await supabase.from('whatsapp_requests').insert([
        {
          number,
          name,
          message,
          status,
          response,
          type: customTemplate ? 'custom_template' : (type || (template ? 'template' : 'text')),
          template: template || (type !== 'text' ? 'hello_world' : null),
          language: language || (type !== 'text' ? 'en_US' : null),
          components,
          custom_template: customTemplate || false,
        },
      ]);
      console.log('💾 Request stored in database');
    } catch (dbError: any) {
      console.error('❌ Failed to store request in database:', dbError.message);
      // Don't fail the request if database storage fails
    }

    // Log final status
    if (status === 'sent') {
      console.log(`✅ [WhatsApp] Successfully sent to ${number}: status=${status}`);
    } else {
      console.error(`❌ [WhatsApp] Failed to send to ${number}: status=${status}, error=${errorMessage}`);
    }

    if (status === 'failed') {
      return NextResponse.json({ 
        error: errorMessage || response?.error || 'Failed to send WhatsApp message',
        details: response?.error,
        template: template,
        status: status
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      response,
      message: 'WhatsApp message sent successfully'
    });
  } catch (error: any) {
    console.error('❌ WhatsApp API error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to send WhatsApp message',
      status: 'error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  // Validate authentication
  const authResult = await validateAuth(request);
  if (authResult.error) {
    return NextResponse.json({ error: authResult.error }, { status: 401 });
  }

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