#!/usr/bin/env node

/**
 * Debug script to check WhatsApp templates in Meta vs local database
 */

const fetch = require('node-fetch');

// Configuration
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN;

async function debugTemplates() {
  console.log('🔍 Debugging WhatsApp templates...\n');

  if (!WHATSAPP_TOKEN || !WHATSAPP_BUSINESS_ACCOUNT_ID) {
    console.error('❌ WhatsApp API credentials not set');
    console.log('Please set WHATSAPP_TOKEN and WHATSAPP_BUSINESS_ACCOUNT_ID');
    process.exit(1);
  }

  try {
    // Step 1: Check templates in Meta WhatsApp Business API
    console.log('📋 Step 1: Checking templates in Meta WhatsApp Business API...');
    const metaUrl = `https://graph.facebook.com/v19.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`;
    const metaRes = await fetch(metaUrl, {
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
      },
    });
    
    const metaData = await metaRes.json();
    
    if (!metaRes.ok) {
      console.error('❌ Failed to fetch from Meta:', metaData);
      return;
    }
    
    console.log(`✅ Found ${metaData.data?.length || 0} templates in Meta`);
    
    if (metaData.data && metaData.data.length > 0) {
      console.log('\n📋 Meta Templates:');
      metaData.data.forEach((template, index) => {
        console.log(`  ${index + 1}. ${template.name}`);
        console.log(`     Language: ${template.language}`);
        console.log(`     Status: ${template.status}`);
        console.log(`     Category: ${template.category}`);
        console.log(`     ID: ${template.id}`);
        console.log('');
      });
    }

    // Step 2: Check local database templates
    if (AUTH_TOKEN) {
      console.log('📋 Step 2: Checking templates in local database...');
      const localRes = await fetch(`${BASE_URL}/api/whatsapp/custom-templates`, {
        headers: {
          'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
      });
      
      const localData = await localRes.json();
      
      if (localRes.ok) {
        console.log(`✅ Found ${localData.templates?.length || 0} templates in local database`);
        
        if (localData.templates && localData.templates.length > 0) {
          console.log('\n📋 Local Templates:');
          localData.templates.forEach((template, index) => {
            console.log(`  ${index + 1}. ${template.name}`);
            console.log(`     WhatsApp Template Name: ${template.whatsapp_template_name || 'Not set'}`);
            console.log(`     Language: ${template.language}`);
            console.log(`     Status: ${template.status || 'No status'}`);
            console.log(`     Variables: ${template.variables?.length || 0}`);
            console.log('');
          });
        }
      } else {
        console.error('❌ Failed to fetch local templates:', localData.error);
      }
    } else {
      console.log('⚠️  No AUTH_TOKEN provided, skipping local database check');
    }

    // Step 3: Check for survey_test specifically
    console.log('🔍 Step 3: Looking for survey_test template...');
    
    const surveyTestInMeta = metaData.data?.find((t) => 
      t.name === 'survey_test' || 
      t.name.includes('survey_test') ||
      'survey_test'.includes(t.name)
    );
    
    if (surveyTestInMeta) {
      console.log('✅ Found survey_test in Meta:');
      console.log(`  Name: ${surveyTestInMeta.name}`);
      console.log(`  Language: ${surveyTestInMeta.language}`);
      console.log(`  Status: ${surveyTestInMeta.status}`);
      console.log(`  ID: ${surveyTestInMeta.id}`);
    } else {
      console.log('❌ survey_test not found in Meta');
      console.log('Available templates with similar names:');
      metaData.data?.forEach((t) => {
        if (t.name.includes('survey') || t.name.includes('test')) {
          console.log(`  - ${t.name} (${t.language}) - ${t.status}`);
        }
      });
    }

    // Step 4: Test template validation
    console.log('\n🧪 Step 4: Testing template validation...');
    
    // Test with different language mappings
    const testLanguages = ['en', 'en_US', 'en_GB'];
    
    for (const lang of testLanguages) {
      console.log(`\n🔍 Testing with language: ${lang}`);
      
      const testUrl = `https://graph.facebook.com/v19.0/${WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates`;
      const testRes = await fetch(testUrl, {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        },
      });
      
      const testData = await testRes.json();
      
      if (testRes.ok && testData.data) {
        const template = testData.data.find((t) => 
          t.name === 'survey_test' && t.language === lang
        );
        
        if (template) {
          console.log(`✅ Found survey_test with language ${lang}:`, {
            name: template.name,
            language: template.language,
            status: template.status
          });
        } else {
          console.log(`❌ survey_test not found with language ${lang}`);
        }
      }
    }

    console.log('\n🎉 Debug completed!');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    process.exit(1);
  }
}

// Run the debug
debugTemplates(); 