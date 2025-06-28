import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET: Fetch all custom templates (authenticated users only)
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
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

    const { data, error } = await userSupabase
      .from('custom_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ templates: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new custom template (authenticated users only)
export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
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

    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.body) {
      return NextResponse.json({ error: 'Name and body are required' }, { status: 400 });
    }

    // Validate template name: lowercase, underscores, no spaces or special chars
    if (!/^[a-z0-9_]+$/.test(body.name)) {
      return NextResponse.json({ 
        error: 'Template name must be lowercase, use only letters, numbers, and underscores (no spaces or special characters).' 
      }, { status: 400 });
    }

    // Extract variables from body text
    const bodyMatches = [...body.body.matchAll(/\{\{(\w+)\}\}/g)];
    const variables = bodyMatches.map(m => m[1]);

    // Extract variables from header if present
    if (body.header) {
      const headerMatches = [...body.header.matchAll(/\{\{(\w+)\}\}/g)];
      headerMatches.forEach(m => {
        if (!variables.includes(m[1])) {
          variables.push(m[1]);
        }
      });
    }

    // Extract variables from footer if present
    if (body.footer) {
      const footerMatches = [...body.footer.matchAll(/\{\{(\w+)\}\}/g)];
      footerMatches.forEach(m => {
        if (!variables.includes(m[1])) {
          variables.push(m[1]);
        }
      });
    }

    // Extract variables from button URLs if present
    if (body.buttons && Array.isArray(body.buttons)) {
      body.buttons.forEach((btn: any) => {
        if (btn.url) {
          const urlMatches = [...btn.url.matchAll(/\{\{(\w+)\}\}/g)];
          urlMatches.forEach(m => {
            if (!variables.includes(m[1])) {
              variables.push(m[1]);
            }
          });
        }
      });
    }

    const templateData = {
      name: body.name,
      description: body.description || '',
      category: body.category || 'UTILITY',
      body: body.body,
      header: body.header || null,
      footer: body.footer || null,
      buttons: body.buttons || null,
      variables: variables
    };

    const { data, error } = await userSupabase
      .from('custom_templates')
      .insert([templateData])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: 'Template name already exists' }, { status: 400 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ template: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update a custom template (authenticated users only)
export async function PUT(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
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

    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    // Extract variables from body text
    const bodyMatches = [...body.body.matchAll(/\{\{(\w+)\}\}/g)];
    const variables = bodyMatches.map(m => m[1]);

    // Extract variables from header if present
    if (body.header) {
      const headerMatches = [...body.header.matchAll(/\{\{(\w+)\}\}/g)];
      headerMatches.forEach(m => {
        if (!variables.includes(m[1])) {
          variables.push(m[1]);
        }
      });
    }

    // Extract variables from footer if present
    if (body.footer) {
      const footerMatches = [...body.footer.matchAll(/\{\{(\w+)\}\}/g)];
      footerMatches.forEach(m => {
        if (!variables.includes(m[1])) {
          variables.push(m[1]);
        }
      });
    }

    // Extract variables from button URLs if present
    if (body.buttons && Array.isArray(body.buttons)) {
      body.buttons.forEach((btn: any) => {
        if (btn.url) {
          const urlMatches = [...btn.url.matchAll(/\{\{(\w+)\}\}/g)];
          urlMatches.forEach(m => {
            if (!variables.includes(m[1])) {
              variables.push(m[1]);
            }
          });
        }
      });
    }

    const updateData = {
      description: body.description || '',
      category: body.category || 'UTILITY',
      body: body.body,
      header: body.header || null,
      footer: body.footer || null,
      buttons: body.buttons || null,
      variables: variables,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await userSupabase
      .from('custom_templates')
      .update(updateData)
      .eq('id', body.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ template: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Fix templates that are missing whatsapp_template_name
export async function PATCH(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
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

    console.log('🔧 Starting template fix process...');

    // Get all templates that are missing whatsapp_template_name
    const { data: templates, error: fetchError } = await userSupabase
      .from('custom_templates')
      .select('*')
      .or('whatsapp_template_name.is.null,whatsapp_template_name.eq.')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Error fetching templates:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    console.log(`📋 Found ${templates?.length || 0} templates that need fixing`);

    if (!templates || templates.length === 0) {
      return NextResponse.json({ 
        success: true, 
        fixed_count: 0,
        fixed_templates: [],
        message: 'All templates are already properly configured!'
      });
    }

    const fixedTemplates = [];
    const failedTemplates = [];
    
    for (const template of templates) {
      console.log(`🔧 Fixing template: ${template.name}`);
      
      try {
        // Update the template to use its name as the whatsapp_template_name
        const { data: updatedTemplate, error: updateError } = await userSupabase
          .from('custom_templates')
          .update({ 
            whatsapp_template_name: template.name,
            status: 'APPROVED', // Also set status to APPROVED
            updated_at: new Date().toISOString()
          })
          .eq('id', template.id)
          .select()
          .single();

        if (updateError) {
          console.error(`❌ Error updating template ${template.name}:`, updateError);
          failedTemplates.push({
            name: template.name,
            error: updateError.message
          });
        } else {
          console.log(`✅ Fixed template: ${template.name} -> whatsapp_template_name: ${template.name}`);
          fixedTemplates.push(updatedTemplate);
        }
      } catch (error: any) {
        console.error(`❌ Unexpected error fixing template ${template.name}:`, error);
        failedTemplates.push({
          name: template.name,
          error: error.message
        });
      }
    }

    const response = {
      success: true, 
      fixed_count: fixedTemplates.length,
      total_templates: templates.length,
      fixed_templates: fixedTemplates,
      failed_templates: failedTemplates,
      message: `Fixed ${fixedTemplates.length} out of ${templates.length} templates`
    };

    if (failedTemplates.length > 0) {
      response.message += `. ${failedTemplates.length} templates could not be fixed.`;
    }

    console.log(`🎉 Template fixing completed! ${response.message}`);

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('❌ Template fix process failed:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to fix templates',
      success: false
    }, { status: 500 });
  }
}

// DELETE: Delete a custom template (authenticated users only)
export async function DELETE(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 });
    }

    const { error } = await userSupabase
      .from('custom_templates')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 