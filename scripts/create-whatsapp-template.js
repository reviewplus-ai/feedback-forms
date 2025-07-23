#!/usr/bin/env node

/**
 * WhatsApp Template Creator Script
 * 
 * This script helps you create WhatsApp message templates using your API.
 * 
 * Usage:
 * node scripts/create-whatsapp-template.js <template-name>
 * 
 * Example:
 * node scripts/create-whatsapp-template.js customer_feedback_request
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const AUTH_TOKEN = process.env.AUTH_TOKEN;

if (!AUTH_TOKEN) {
  console.error('❌ AUTH_TOKEN environment variable is required');
  console.log('💡 Set it with: export AUTH_TOKEN="your-auth-token"');
  process.exit(1);
}

// Template definitions
const TEMPLATES = {
  customer_feedback_request: {
    name: 'customer_feedback_request',
    description: 'Template for requesting customer feedback after a service or purchase',
    category: 'UTILITY',
    survey_type: 'CUSTOM',
    language: 'en',
    header: 'Thank you for choosing {{company_name}}!',
    body: `Hi {{customer_name}},

We hope you enjoyed your recent {{service_type}} experience with us. Your feedback is incredibly valuable and helps us improve our services.

Could you please take a moment to share your thoughts? Your review will help other customers make informed decisions.

Service Details:
• Date: {{service_date}}
• Order/Booking: {{order_id}}
• Service: {{service_type}}

Click the link below to leave your review:
{{review_link}}

Thank you for your time!`,
    footer: '{{company_name}} - Delivering excellence since {{year}}',
    buttons: [
      {
        text: 'Leave Review',
        url: '{{review_link}}'
      },
      {
        text: 'Contact Support',
        url: '{{support_link}}'
      }
    ]
  },
  
  order_confirmation: {
    name: 'order_confirmation',
    description: 'Template for confirming customer orders',
    category: 'UTILITY',
    survey_type: 'CUSTOM',
    language: 'en',
    header: 'Order Confirmed - {{company_name}}',
    body: `Hi {{customer_name}},

Your order has been confirmed and is being processed!

Order Details:
• Order #: {{order_number}}
• Items: {{item_count}} items
• Total: {{total_amount}}
• Estimated Delivery: {{delivery_date}}

Track your order: {{tracking_link}}

Thank you for your purchase!`,
    footer: 'Questions? Contact us at {{support_phone}}',
    buttons: [
      {
        text: 'Track Order',
        url: '{{tracking_link}}'
      },
      {
        text: 'View Order',
        url: '{{order_link}}'
      }
    ]
  },
  
  appointment_reminder: {
    name: 'appointment_reminder',
    description: 'Template for appointment reminders',
    category: 'UTILITY',
    survey_type: 'CUSTOM',
    language: 'en',
    header: 'Appointment Reminder',
    body: `Hi {{customer_name}},

This is a friendly reminder about your upcoming appointment:

📅 Date: {{appointment_date}}
⏰ Time: {{appointment_time}}
📍 Location: {{location}}
👨‍⚕️ Provider: {{provider_name}}

Please arrive 10 minutes early. If you need to reschedule, please call us at {{phone_number}}.

We look forward to seeing you!`,
    footer: '{{company_name}} - {{phone_number}}',
    buttons: [
      {
        text: 'Reschedule',
        url: '{{reschedule_link}}'
      },
      {
        text: 'Directions',
        url: '{{directions_link}}'
      }
    ]
  },
  
  welcome_message: {
    name: 'welcome_message',
    description: 'Template for welcoming new customers',
    category: 'UTILITY',
    survey_type: 'CUSTOM',
    language: 'en',
    header: 'Welcome to {{company_name}}!',
    body: `Hi {{customer_name}},

Welcome to the {{company_name}} family! 🎉

We're excited to have you on board and can't wait to provide you with exceptional service.

Here's what you can expect:
• {{benefit_1}}
• {{benefit_2}}
• {{benefit_3}}

Get started by exploring our services: {{services_link}}

If you have any questions, our team is here to help!`,
    footer: '{{company_name}} - {{support_email}}',
    buttons: [
      {
        text: 'Explore Services',
        url: '{{services_link}}'
      },
      {
        text: 'Contact Us',
        url: '{{contact_link}}'
      }
    ]
  }
};

async function createTemplate(templateName) {
  try {
    console.log(`🚀 Creating WhatsApp template: ${templateName}`);
    
    if (!TEMPLATES[templateName]) {
      console.error(`❌ Template '${templateName}' not found`);
      console.log('📋 Available templates:');
      Object.keys(TEMPLATES).forEach(name => {
        console.log(`  - ${name}: ${TEMPLATES[name].description}`);
      });
      return;
    }
    
    const templateData = TEMPLATES[templateName];
    
    console.log('📤 Sending template creation request...');
    
    const response = await fetch(`${BASE_URL}/api/whatsapp/templates`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(templateData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Template created successfully!');
      console.log('📊 Template details:', JSON.stringify(data, null, 2));
      
      // Save template to file
      const filename = `${templateName}_template.json`;
      fs.writeFileSync(filename, JSON.stringify(templateData, null, 2));
      console.log(`💾 Template saved to: ${filename}`);
      
    } else {
      console.error('❌ Failed to create template:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error creating template:', error.message);
  }
}

async function listTemplates() {
  try {
    console.log('📋 Fetching existing templates...');
    
    const response = await fetch(`${BASE_URL}/api/whatsapp/custom-templates`, {
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ Found ${data.templates.length} templates:`);
      data.templates.forEach(template => {
        console.log(`  - ${template.name}: ${template.description} (${template.status})`);
      });
    } else {
      console.error('❌ Failed to fetch templates:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error fetching templates:', error.message);
  }
}

async function testTemplate(templateName, phoneNumber) {
  try {
    console.log(`🧪 Testing template: ${templateName} with phone: ${phoneNumber}`);
    
    // Sample variables for testing
    const testVariables = {
      customer_name: 'John Doe',
      company_name: 'Acme Corp',
      service_type: 'consultation',
      service_date: '2024-01-15',
      order_id: 'ORD-12345',
      review_link: 'https://example.com/review',
      support_link: 'https://example.com/support',
      year: '2024'
    };
    
    const response = await fetch(`${BASE_URL}/api/whatsapp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        number: phoneNumber,
        template: templateName,
        customTemplate: true,
        components: testVariables
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Test message sent successfully!');
      console.log('📊 Response:', JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Test failed:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error testing template:', error.message);
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log('📖 WhatsApp Template Creator');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/create-whatsapp-template.js <command> [options]');
    console.log('');
    console.log('Commands:');
    console.log('  create <template-name>  - Create a specific template');
    console.log('  list                    - List all available templates');
    console.log('  test <template> <phone> - Test a template with a phone number');
    console.log('');
    console.log('Available templates:');
    Object.keys(TEMPLATES).forEach(name => {
      console.log(`  - ${name}: ${TEMPLATES[name].description}`);
    });
    return;
  }
  
  switch (command) {
    case 'create':
      const templateName = args[1];
      if (!templateName) {
        console.error('❌ Template name is required');
        return;
      }
      await createTemplate(templateName);
      break;
      
    case 'list':
      await listTemplates();
      break;
      
    case 'test':
      const testTemplateName = args[1];
      const phoneNumber = args[2];
      if (!testTemplateName || !phoneNumber) {
        console.error('❌ Template name and phone number are required');
        return;
      }
      await testTemplate(testTemplateName, phoneNumber);
      break;
      
    default:
      console.error(`❌ Unknown command: ${command}`);
  }
}

// Run the script
main().catch(console.error); 