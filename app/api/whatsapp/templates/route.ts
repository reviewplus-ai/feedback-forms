import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

// Function to map language codes to WhatsApp format
function getWhatsAppLanguageCode(language: string): string {
  // Only include languages that are supported by WhatsApp Business API
  const languageMap: { [key: string]: string } = {
    'en': 'en_US',
    'es': 'es_ES',
    'fr': 'fr_FR',
    'de': 'de_DE',
    'ar': 'ar_AR',
    'pt': 'pt_BR',
    'it': 'it_IT',
    'ja': 'ja_JP',
    'ko': 'ko_KR',
    'zh': 'zh_CN',
    'ru': 'ru_RU',
    'tr': 'tr_TR',
    'nl': 'nl_NL',
    'pl': 'pl_PL',
    'th': 'th_TH',
    'vi': 'vi_VN',
    'id': 'id_ID',
    'ms': 'ms_MY',
    'tl': 'tl_PH'
  };
  
  return languageMap[language] || 'en_US';
}

// Function to generate unique template name
async function generateUniqueTemplateName(baseName: string): Promise<string> {
  let counter = 1;
  let uniqueName = baseName;
  
  while (counter <= 100) { // Prevent infinite loop
    try {
      // Check if template exists by trying to get it
      const url = `https://graph.facebook.com/v19.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates?name=${uniqueName}`;
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        },
      });
      
      const data = await res.json();
      
      // If no templates found with this name, it's available
      if (!data.data || data.data.length === 0) {
        return uniqueName;
      }
      
      // Name exists, try next
      uniqueName = `${baseName}_${counter}`;
      counter++;
    } catch (error) {
      // If error occurs, assume name is available
      return uniqueName;
    }
  }
  
  // Fallback: add timestamp
  return `${baseName}_${Date.now()}`;
}

// Function to validate authentication
async function validateAuth(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Authentication required' };
  }

  const token = authHeader.substring(7);
  
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

// Function to create WhatsApp template via Meta Graph API
async function createWhatsAppTemplate(templateData: any) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_BUSINESS_ACCOUNT_ID) {
    throw new Error('WhatsApp API credentials not set');
  }

  const url = `https://graph.facebook.com/v19.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`;
  
  // Build template components according to Meta's requirements
  const components: any[] = [];
  
  // Add header if present
  if (templateData.header) {
    components.push({
      type: 'HEADER',
      format: 'TEXT',
      text: templateData.header
    });
  }
  
  // Add body
  components.push({
    type: 'BODY',
    text: templateData.body
  });
  
  // Add footer if present
  if (templateData.footer) {
    components.push({
      type: 'FOOTER',
      text: templateData.footer
    });
  }
  
  // Add URL buttons if present (like old version)
  if (templateData.buttons && Array.isArray(templateData.buttons) && templateData.buttons.length > 0) {
    components.push({
      type: 'BUTTONS',
      buttons: templateData.buttons.map((btn: any) => ({
        type: 'URL',
        text: btn.text,
        url: btn.url
      }))
    });
  }

  const payload = {
    name: templateData.name,
    category: templateData.category || 'UTILITY',
    language: getWhatsAppLanguageCode(templateData.language || 'en'),
    components: components
  };

  console.log('Creating WhatsApp template with payload:', JSON.stringify(payload, null, 2));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    // Add timeout to prevent long waits
    signal: AbortSignal.timeout(15000) // 15 second timeout
  });
  
  const data = await res.json();
  console.log('WhatsApp API response:', JSON.stringify(data, null, 2));
  
  if (!res.ok) {
    throw new Error(data.error?.message || `Failed to create WhatsApp template: ${JSON.stringify(data)}`);
  }
  
  return data;
}

// Function to get all WhatsApp templates
async function getWhatsAppTemplates() {
  if (!WHATSAPP_TOKEN || !WHATSAPP_BUSINESS_ACCOUNT_ID) {
    throw new Error('WhatsApp API credentials not set');
  }

  const url = `https://graph.facebook.com/v19.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`;
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
    },
  });
  
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Failed to get WhatsApp templates');
  }
  
  return data;
}

// Function to check WhatsApp template status
async function checkWhatsAppTemplateStatus(templateId: string) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_BUSINESS_ACCOUNT_ID) {
    throw new Error('WhatsApp API credentials not set');
  }

  const url = `https://graph.facebook.com/v19.0/${templateId}`;
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
    },
  });
  
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Failed to get template status');
  }
  
  return data;
}

// Function to update template status in database
async function updateTemplateStatus(templateId: string, status: string) {
  const { error } = await supabase
    .from('custom_templates')
    .update({ status: status })
    .eq('whatsapp_template_id', templateId);

  if (error) {
    console.error('Failed to update template status:', error);
  }
}

// Function to refresh all template statuses
async function refreshAllTemplateStatuses() {
  const { data: templates, error } = await supabase
    .from('custom_templates')
    .select('whatsapp_template_id, id')
    .not('whatsapp_template_id', 'is', null);

  if (error) {
    throw new Error('Failed to fetch templates for status refresh');
  }

  const results = [];
  for (const template of templates) {
    try {
      const statusData = await checkWhatsAppTemplateStatus(template.whatsapp_template_id);
      const newStatus = statusData.status || 'PENDING';
      
      // Update database
      await updateTemplateStatus(template.whatsapp_template_id, newStatus);
      
      results.push({
        id: template.id,
        whatsapp_template_id: template.whatsapp_template_id,
        status: newStatus
      });
    } catch (error: any) {
      results.push({
        id: template.id,
        whatsapp_template_id: template.whatsapp_template_id,
        status: 'ERROR',
        error: error.message
      });
    }
  }
  
  return results;
}

// Function to sync templates from Meta WhatsApp Business API
async function syncTemplatesFromMeta() {
  if (!WHATSAPP_TOKEN || !WHATSAPP_BUSINESS_ACCOUNT_ID) {
    throw new Error('WhatsApp API credentials not set');
  }

  try {
    console.log('🔄 Syncing templates from Meta WhatsApp Business API...');
    
    const url = `https://graph.facebook.com/v19.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error?.message || 'Failed to fetch templates from Meta');
    }
    
    console.log(`📋 Found ${data.data?.length || 0} templates in Meta`);
    
    // Get all custom templates from our database
    const { data: customTemplates, error: dbError } = await supabase
      .from('custom_templates')
      .select('*');
    
    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`);
    }
    
    const syncResults = [];
    
    // Update each custom template with Meta data
    for (const customTemplate of customTemplates || []) {
      console.log(`🔍 Checking template: ${customTemplate.name}`);
      
      // Find matching template in Meta
      const metaTemplate = data.data?.find((t: any) => 
        t.name === customTemplate.whatsapp_template_name || 
        t.name === customTemplate.name
      );
      
      if (metaTemplate) {
        console.log(`✅ Found matching template in Meta: ${metaTemplate.name} (${metaTemplate.status})`);
        
        // Update the template with Meta data
        const updateData = {
          whatsapp_template_id: metaTemplate.id,
          whatsapp_template_name: metaTemplate.name,
          status: metaTemplate.status,
          updated_at: new Date().toISOString()
        };
        
        const { error: updateError } = await supabase
          .from('custom_templates')
          .update(updateData)
          .eq('id', customTemplate.id);
        
        if (updateError) {
          console.error(`❌ Failed to update template ${customTemplate.name}:`, updateError);
          syncResults.push({
            name: customTemplate.name,
            status: 'failed',
            error: updateError.message
          });
        } else {
          console.log(`✅ Updated template ${customTemplate.name} with Meta data`);
          syncResults.push({
            name: customTemplate.name,
            status: 'synced',
            meta_status: metaTemplate.status,
            meta_name: metaTemplate.name
          });
        }
      } else {
        console.log(`❌ No matching template found in Meta for: ${customTemplate.name}`);
        syncResults.push({
          name: customTemplate.name,
          status: 'not_found_in_meta',
          error: 'Template not found in Meta WhatsApp Business API'
        });
      }
    }
    
    return {
      success: true,
      meta_templates_count: data.data?.length || 0,
      custom_templates_count: customTemplates?.length || 0,
      sync_results: syncResults
    };
    
  } catch (error: any) {
    console.error('❌ Sync failed:', error);
    throw error;
  }
}

// POST: Create a new WhatsApp template
export async function POST(request: NextRequest) {
  try {
    const authResult = await validateAuth(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const body = await request.json();
    
    if (!body.name || !body.body) {
      return NextResponse.json({ error: 'Name and body are required' }, { status: 400 });
    }

    // Validate template name format
    if (!/^[a-z0-9_]+$/.test(body.name)) {
      return NextResponse.json({ 
        error: 'Template name must be lowercase, use only letters, numbers, and underscores (no spaces or special characters).' 
      }, { status: 400 });
    }

    // Validate body length (WhatsApp has limits)
    if (body.body.length > 1024) {
      return NextResponse.json({ error: 'Body text is too long. Maximum 1024 characters allowed.' }, { status: 400 });
    }

    // Validate header length if present
    if (body.header && body.header.length > 60) {
      return NextResponse.json({ error: 'Header text is too long. Maximum 60 characters allowed.' }, { status: 400 });
    }

    // Validate footer length if present
    if (body.footer && body.footer.length > 60) {
      return NextResponse.json({ error: 'Footer text is too long. Maximum 60 characters allowed.' }, { status: 400 });
    }

    // Validate language support
    const languageCode = getWhatsAppLanguageCode(body.language || 'en');
    const supportedLanguages = ['en_US', 'es_ES', 'fr_FR', 'de_DE', 'ar_AR', 'pt_BR', 'it_IT', 'ja_JP', 'ko_KR', 'zh_CN', 'ru_RU', 'tr_TR', 'nl_NL', 'pl_PL', 'th_TH', 'vi_VN', 'id_ID', 'ms_MY', 'tl_PH'];
    if (!supportedLanguages.includes(languageCode)) {
      return NextResponse.json({ 
        error: `Language '${body.language}' is not supported for WhatsApp templates. Supported languages: ${supportedLanguages.join(', ')}` 
      }, { status: 400 });
    }

    console.log('Creating template with data:', JSON.stringify(body, null, 2));

    // Create WhatsApp template via Meta API (simplified like old version)
    let whatsappTemplate = null;
    let templateStatus = 'PENDING';
    let whatsappTemplateName = body.name; // Use local name as fallback
    
    try {
      whatsappTemplate = await createWhatsAppTemplate(body);
      templateStatus = 'APPROVED'; // Assume approved if creation succeeds
      whatsappTemplateName = whatsappTemplate.name;
      console.log('✅ WhatsApp template created successfully via Meta API');
    } catch (error: any) {
      console.warn('⚠️ Failed to create WhatsApp template via Meta API:', error.message);
      
      // Check if it's a network error
      if (error.message.includes('fetch failed') || error.message.includes('ETIMEDOUT') || error.message.includes('timeout')) {
        console.log('🔄 Network error detected - saving template to database with PENDING status');
        templateStatus = 'PENDING';
      } else {
        // For other errors (like validation errors), still save but mark as PENDING
        console.log('🔄 API error detected - saving template to database with PENDING status');
        templateStatus = 'PENDING';
      }
    }
    
    // Store in our database with appropriate status
    const { data, error } = await supabase
      .from('custom_templates')
      .insert([{
        name: body.name,
        description: body.description || '',
        category: body.category || 'UTILITY',
        survey_type: body.survey_type || 'CUSTOM',
        language: body.language || 'en',
        body: body.body,
        header: body.header || null,
        footer: body.footer || null,
        buttons: body.buttons || null,
        variables: body.variables || [],
        whatsapp_template_id: whatsappTemplate?.id || null,
        whatsapp_template_name: whatsappTemplateName,
        status: templateStatus
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      
      // Check if it's a schema error
      if (error.message.includes('whatsapp_template')) {
        return NextResponse.json({ 
          error: 'Database schema is missing required columns. Please run the database migration script.',
          details: error.message,
          solution: 'Run the check_and_fix_schema.sql script in your Supabase SQL editor'
        }, { status: 500 });
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      template: data,
      whatsapp_template: whatsappTemplate,
      message: `Template created successfully with WhatsApp template name: ${whatsappTemplateName}`
    });
  } catch (error: any) {
    console.error('Template creation error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create template' }, { status: 500 });
  }
}

// GET: Get all WhatsApp templates from Meta API
export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAuth(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const test = searchParams.get('test');
    const listTemplates = searchParams.get('list');
    const sync = searchParams.get('sync');

    // If test=1, just test the connection
    if (test === '1') {
      try {
        const templates = await getWhatsAppTemplates();
        return NextResponse.json({ 
          success: true, 
          message: 'WhatsApp API connection successful',
          whatsapp_templates: templates.data || []
        });
      } catch (error: any) {
        return NextResponse.json({ 
          error: error.message || 'Failed to connect to WhatsApp API',
          success: false
        }, { status: 500 });
      }
    }

    // If list=1, return detailed template information
    if (listTemplates === '1') {
      try {
        console.log('📋 Fetching WhatsApp templates from Meta API...');
        const templates = await getWhatsAppTemplates();
        
        if (!templates.data || templates.data.length === 0) {
          return NextResponse.json({ 
            success: true, 
            message: 'No templates found in WhatsApp Business account',
            whatsapp_templates: [],
            count: 0
          });
        }

        console.log(`✅ Found ${templates.data.length} templates in WhatsApp Business account`);
        
        // Format the response for better readability
        const formattedTemplates = templates.data.map((template: any) => ({
          id: template.id,
          name: template.name,
          language: template.language,
          status: template.status,
          category: template.category,
          components: template.components,
          created_at: template.created_at,
          updated_at: template.updated_at
        }));

        return NextResponse.json({ 
          success: true, 
          whatsapp_templates: formattedTemplates,
          count: templates.data.length,
          message: `Found ${templates.data.length} templates in WhatsApp Business account`
        });
      } catch (error: any) {
        console.error('❌ Failed to fetch WhatsApp templates:', error);
        return NextResponse.json({ 
          error: error.message || 'Failed to fetch WhatsApp templates',
          success: false
        }, { status: 500 });
      }
    }

    // If sync=1, sync templates from Meta
    if (sync === '1') {
      try {
        console.log('🔄 Starting template sync from Meta...');
        const syncResult = await syncTemplatesFromMeta();
        
        return NextResponse.json({ 
          success: true, 
          message: 'Templates synced successfully from Meta',
          meta_templates_count: syncResult.meta_templates_count,
          custom_templates_count: syncResult.custom_templates_count,
          sync_results: syncResult.sync_results
        });
      } catch (error: any) {
        console.error('❌ Template sync failed:', error);
        return NextResponse.json({ 
          error: error.message || 'Failed to sync templates from Meta',
          success: false
        }, { status: 500 });
      }
    }

    // Default: return custom templates from database
    const { data: customTemplates, error } = await supabase
      .from('custom_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      templates: customTemplates || [],
      count: customTemplates?.length || 0
    });
  } catch (error: any) {
    console.error('❌ Template API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Delete a WhatsApp template
export async function DELETE(request: NextRequest) {
  try {
    const authResult = await validateAuth(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');
    
    if (!templateId) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    // Get template from database
    const { data: template, error: fetchError } = await supabase
      .from('custom_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (fetchError || !template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Delete from WhatsApp API if template ID exists
    if (template.whatsapp_template_id) {
      const url = `https://graph.facebook.com/v19.0/${template.whatsapp_template_id}`;
      
      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        },
      });
      
      if (!res.ok) {
        console.error('Failed to delete WhatsApp template:', await res.text());
      }
    }

    // Delete from our database
    const { error: deleteError } = await supabase
      .from('custom_templates')
      .delete()
      .eq('id', templateId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 