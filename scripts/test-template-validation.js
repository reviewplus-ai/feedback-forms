// Load environment variables from both .env and .env.local
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

async function testTemplateValidation() {
  try {
    console.log('🧪 Testing template validation for survey_test...\n');
    
    if (!WHATSAPP_TOKEN || !WHATSAPP_BUSINESS_ACCOUNT_ID) {
      console.error('❌ WhatsApp API credentials not set');
      return;
    }

    console.log('1️⃣ Fetching all templates from WhatsApp Business API...');
    
    const url = `https://graph.facebook.com/v19.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`;
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      },
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      console.error('❌ Failed to fetch templates:', data);
      return;
    }

    console.log(`✅ Found ${data.data?.length || 0} templates\n`);
    
    console.log('2️⃣ Looking for survey_test template...');
    
    const surveyTestTemplate = data.data?.find((t) => 
      t.name === 'survey_test' && 
      t.language === 'en_US'
    );
    
    if (surveyTestTemplate) {
      console.log('✅ Found survey_test template:');
      console.log(`   Name: ${surveyTestTemplate.name}`);
      console.log(`   Language: ${surveyTestTemplate.language}`);
      console.log(`   Status: ${surveyTestTemplate.status}`);
      console.log(`   Category: ${surveyTestTemplate.category}`);
      console.log(`   ID: ${surveyTestTemplate.id}`);
      
      if (surveyTestTemplate.status === 'APPROVED') {
        console.log('\n🎉 Template is APPROVED and ready to use!');
      } else {
        console.log(`\n⚠️ Template status is ${surveyTestTemplate.status}, not ready for use.`);
      }
    } else {
      console.log('❌ survey_test template not found for en_US language');
      
      // Show similar templates
      console.log('\n📋 Similar templates found:');
      data.data?.forEach((t) => {
        if (t.name.includes('survey') || t.name.includes('test')) {
          console.log(`   - ${t.name} (${t.language}) - ${t.status}`);
        }
      });
    }
    
    console.log('\n3️⃣ Testing language variations...');
    
    // Test different language codes
    const languages = ['en_US', 'en', 'en_GB'];
    languages.forEach(lang => {
      const template = data.data?.find((t) => 
        t.name === 'survey_test' && 
        t.language === lang
      );
      console.log(`   ${lang}: ${template ? '✅ Found' : '❌ Not found'}`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testTemplateValidation()
  .then(() => {
    console.log('\n✅ Template validation test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }); 