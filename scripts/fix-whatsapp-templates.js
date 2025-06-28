// Load environment variables from both .env and .env.local
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function fixWhatsAppTemplates() {
  try {
    console.log('🔧 Starting WhatsApp template fix process...');
    
    // Get all templates that are missing whatsapp_template_name
    const { data: templates, error } = await supabase
      .from('custom_templates')
      .select('*')
      .or('whatsapp_template_name.is.null,whatsapp_template_name.eq.')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching templates:', error);
      return;
    }

    console.log(`📋 Found ${templates.length} templates that need fixing`);

    if (templates.length === 0) {
      console.log('✅ All templates are properly configured!');
      return;
    }

    let fixedCount = 0;
    for (const template of templates) {
      console.log(`🔧 Fixing template: ${template.name}`);
      
      // Update the template to use its name as the whatsapp_template_name
      const { error: updateError } = await supabase
        .from('custom_templates')
        .update({ 
          whatsapp_template_name: template.name,
          status: 'APPROVED' // Also set status to APPROVED
        })
        .eq('id', template.id);

      if (updateError) {
        console.error(`❌ Error updating template ${template.name}:`, updateError);
      } else {
        console.log(`✅ Fixed template: ${template.name} -> whatsapp_template_name: ${template.name}`);
        fixedCount++;
      }
    }

    console.log(`🎉 Template fixing completed! Fixed ${fixedCount} out of ${templates.length} templates.`);
    
    if (fixedCount < templates.length) {
      console.log('⚠️  Some templates could not be fixed. You may need to delete and recreate them.');
    }
  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  fixWhatsAppTemplates()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixWhatsAppTemplates }; 
fixWhatsAppTemplates(); 