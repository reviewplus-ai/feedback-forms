// Load environment variables from both .env and .env.local
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testWhatsAppTemplates() {
  try {
    console.log('🧪 Testing WhatsApp template system...\n');
    
    // 1. Check database connection
    console.log('1️⃣ Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('custom_templates')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database connection failed:', testError);
      return;
    }
    console.log('✅ Database connection successful\n');
    
    // 2. Get all templates
    console.log('2️⃣ Fetching all templates...');
    const { data: templates, error: fetchError } = await supabase
      .from('custom_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('❌ Failed to fetch templates:', fetchError);
      return;
    }

    console.log(`✅ Found ${templates.length} templates\n`);
    
    // 3. Analyze template status
    console.log('3️⃣ Analyzing template status...');
    const needsFixing = templates.filter(t => !t.whatsapp_template_name);
    const approved = templates.filter(t => t.status === 'APPROVED');
    const pending = templates.filter(t => t.status === 'PENDING');
    const rejected = templates.filter(t => t.status === 'REJECTED');
    const noStatus = templates.filter(t => !t.status);
    
    console.log(`📊 Template Status Summary:`);
    console.log(`   ✅ Approved: ${approved.length}`);
    console.log(`   ⏳ Pending: ${pending.length}`);
    console.log(`   ❌ Rejected: ${rejected.length}`);
    console.log(`   🔧 Need Fixing: ${needsFixing.length}`);
    console.log(`   ❓ No Status: ${noStatus.length}\n`);
    
    // 4. Show templates that need fixing
    if (needsFixing.length > 0) {
      console.log('4️⃣ Templates that need fixing:');
      needsFixing.forEach(template => {
        console.log(`   🔧 ${template.name} - ${template.description || 'No description'}`);
      });
      console.log('');
    }
    
    // 5. Show rejected templates
    if (rejected.length > 0) {
      console.log('5️⃣ Rejected templates:');
      rejected.forEach(template => {
        console.log(`   ❌ ${template.name} - ${template.description || 'No description'}`);
      });
      console.log('');
    }
    
    // 6. Test environment variables
    console.log('6️⃣ Checking environment variables...');
    const requiredVars = [
      'WHATSAPP_TOKEN',
      'WHATSAPP_PHONE_NUMBER_ID',
      'WHATSAPP_BUSINESS_ACCOUNT_ID'
    ];
    
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log('❌ Missing environment variables:');
      missingVars.forEach(varName => {
        console.log(`   - ${varName}`);
      });
      console.log('');
    } else {
      console.log('✅ All required environment variables are set\n');
    }
    
    // 7. Recommendations
    console.log('7️⃣ Recommendations:');
    
    if (needsFixing.length > 0) {
      console.log('   🔧 Run the fix templates script or use the "Fix Templates" button in the UI');
    }
    
    if (rejected.length > 0) {
      console.log('   ❌ Review and recreate rejected templates with different content');
    }
    
    if (missingVars.length > 0) {
      console.log('   ⚙️  Set the missing environment variables in your .env.local file');
    }
    
    if (needsFixing.length === 0 && rejected.length === 0 && missingVars.length === 0) {
      console.log('   ✅ All templates are properly configured!');
    }
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the function if this script is executed directly
if (require.main === module) {
  testWhatsAppTemplates()
    .then(() => {
      console.log('✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = { testWhatsAppTemplates }; 