#!/usr/bin/env node

/**
 * Test script for WhatsApp template sync functionality
 * This script tests the sync endpoint that fetches templates from Meta and updates local database
 */

const fetch = require('node-fetch');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN; // You'll need to set this

async function testTemplateSync() {
  console.log('🔄 Testing WhatsApp template sync functionality...\n');

  if (!AUTH_TOKEN) {
    console.error('❌ TEST_AUTH_TOKEN environment variable is required');
    console.log('Please set it with a valid Supabase auth token');
    process.exit(1);
  }

  try {
    // Test 1: Sync templates from Meta
    console.log('📋 Test 1: Syncing templates from Meta...');
    const syncRes = await fetch(`${BASE_URL}/api/whatsapp/templates?sync=1`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const syncData = await syncRes.json();
    
    if (syncRes.ok) {
      console.log('✅ Sync successful!');
      console.log(`📊 Meta templates found: ${syncData.meta_templates_count}`);
      console.log(`📊 Custom templates processed: ${syncData.custom_templates_count}`);
      console.log(`🔄 Sync results: ${syncData.sync_results?.length || 0} templates processed`);
      
      if (syncData.sync_results && syncData.sync_results.length > 0) {
        console.log('\n📋 Sync Results:');
        syncData.sync_results.forEach((result, index) => {
          console.log(`  ${index + 1}. ${result.name}:`);
          console.log(`     Status: ${result.status}`);
          if (result.meta_status) {
            console.log(`     Meta Status: ${result.meta_status}`);
          }
          if (result.meta_name) {
            console.log(`     Meta Name: ${result.meta_name}`);
          }
          if (result.error) {
            console.log(`     Error: ${result.error}`);
          }
          console.log('');
        });
      }
    } else {
      console.error('❌ Sync failed:', syncData.error);
      return;
    }

    // Test 2: Verify templates were updated
    console.log('🔍 Test 2: Verifying updated templates...');
    const verifyRes = await fetch(`${BASE_URL}/api/whatsapp/custom-templates`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const verifyData = await verifyRes.json();
    
    if (verifyRes.ok) {
      console.log('✅ Templates verification successful!');
      console.log(`📊 Total templates: ${verifyData.templates?.length || 0}`);
      
      if (verifyData.templates && verifyData.templates.length > 0) {
        console.log('\n📋 Template Status:');
        verifyData.templates.forEach((template, index) => {
          console.log(`  ${index + 1}. ${template.name}:`);
          console.log(`     WhatsApp Template Name: ${template.whatsapp_template_name || 'Not set'}`);
          console.log(`     Status: ${template.status || 'Unknown'}`);
          console.log(`     Variables: ${template.variables?.length || 0}`);
          console.log('');
        });
      }
    } else {
      console.error('❌ Template verification failed:', verifyData.error);
    }

    // Test 3: Test sending a message with a synced template
    console.log('📤 Test 3: Testing message sending with synced template...');
    
    // Find an approved template
    const approvedTemplate = verifyData.templates?.find(t => t.status === 'APPROVED' && t.whatsapp_template_name);
    
    if (approvedTemplate) {
      console.log(`✅ Found approved template: ${approvedTemplate.name}`);
      
      // Test sending (you'll need to provide a test number)
      const testNumber = process.env.TEST_PHONE_NUMBER;
      if (testNumber) {
        console.log(`📱 Testing with number: ${testNumber}`);
        
        const sendRes = await fetch(`${BASE_URL}/api/whatsapp`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${AUTH_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            number: testNumber,
            template: approvedTemplate.name,
            customTemplate: true,
            components: approvedTemplate.variables.reduce((acc, v) => {
              acc[v] = `Test ${v}`;
              return acc;
            }, {})
          })
        });

        const sendData = await sendRes.json();
        
        if (sendRes.ok) {
          console.log('✅ Message sent successfully!');
          console.log('📊 Response:', sendData);
        } else {
          console.error('❌ Message sending failed:', sendData.error);
        }
      } else {
        console.log('⚠️  Set TEST_PHONE_NUMBER environment variable to test message sending');
      }
    } else {
      console.log('⚠️  No approved templates found for testing');
    }

    console.log('\n🎉 Template sync test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testTemplateSync(); 