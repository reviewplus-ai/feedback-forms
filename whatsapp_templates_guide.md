# WhatsApp Message Templates Guide

This guide explains how to create and use WhatsApp message templates in your review system.

## 📋 Table of Contents

1. [Template Structure](#template-structure)
2. [Available Templates](#available-templates)
3. [Creating Templates](#creating-templates)
4. [Using Templates](#using-templates)
5. [Template Variables](#template-variables)
6. [Best Practices](#best-practices)
7. [Examples](#examples)

## 🏗️ Template Structure

Each WhatsApp template consists of the following components:

```json
{
  "name": "template_name",
  "description": "Template description",
  "category": "UTILITY|MARKETING",
  "survey_type": "CUSTOM",
  "language": "en",
  "header": "Optional header text",
  "body": "Main message content",
  "footer": "Optional footer text",
  "buttons": [
    {
      "text": "Button text",
      "url": "Button URL"
    }
  ],
  "variables": ["variable1", "variable2"]
}
```

### Component Details:

- **name**: Unique identifier (lowercase, underscores only)
- **description**: Human-readable description
- **category**: UTILITY or MARKETING
- **language**: Language code (en, es, fr, etc.)
- **header**: Optional header (max 60 characters)
- **body**: Main message (max 1024 characters)
- **footer**: Optional footer (max 60 characters)
- **buttons**: Array of clickable buttons (max 2 buttons)
- **variables**: Array of variable names used in the template

## 📚 Available Templates

### 1. Customer Feedback Request
**Purpose**: Request feedback after a service or purchase
**Variables**: customer_name, company_name, service_type, service_date, order_id, review_link, support_link, year

### 2. Order Confirmation
**Purpose**: Confirm customer orders
**Variables**: customer_name, company_name, order_number, item_count, total_amount, delivery_date, tracking_link, order_link, support_phone

### 3. Appointment Reminder
**Purpose**: Remind customers of upcoming appointments
**Variables**: customer_name, appointment_date, appointment_time, location, provider_name, phone_number, company_name, reschedule_link, directions_link

### 4. Delivery Notification
**Purpose**: Notify customers about package delivery
**Variables**: customer_name, order_number, carrier_name, tracking_number, delivery_time, tracking_link, company_name, instructions_link

### 5. Welcome Message
**Purpose**: Welcome new customers
**Variables**: customer_name, company_name, benefit_1, benefit_2, benefit_3, services_link, support_email, contact_link

### 6. Promotional Offer
**Purpose**: Send promotional offers and discounts
**Variables**: customer_name, offer_description, discount_amount, expiry_date, promo_code, shop_link, company_name, terms_link

## 🚀 Creating Templates

### Method 1: Using the Dashboard

1. Navigate to your dashboard
2. Go to the Feedback Request section
3. Click "Create New Template"
4. Fill in the template details
5. Click "Create Template"

### Method 2: Using the API

```bash
# Set your authentication token
export AUTH_TOKEN="your-auth-token"

# Create a template using the script
node scripts/create-whatsapp-template.js create customer_feedback_request

# List existing templates
node scripts/create-whatsapp-template.js list

# Test a template
node scripts/create-whatsapp-template.js test customer_feedback_request +1234567890
```

### Method 3: Direct API Call

```javascript
const response = await fetch('/api/whatsapp/templates', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'my_template',
    description: 'My custom template',
    category: 'UTILITY',
    language: 'en',
    body: 'Hi {{customer_name}}, thank you for your order!',
    variables: ['customer_name']
  })
});
```

## 📱 Using Templates

### Sending a Template Message

```javascript
const response = await fetch('/api/whatsapp', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    number: '+1234567890',
    template: 'customer_feedback_request',
    customTemplate: true,
    components: {
      customer_name: 'John Doe',
      company_name: 'Acme Corp',
      service_type: 'consultation',
      service_date: '2024-01-15',
      order_id: 'ORD-12345',
      review_link: 'https://example.com/review',
      support_link: 'https://example.com/support',
      year: '2024'
    }
  })
});
```

### Using Templates in Automation

Templates can be used in automated workflows:

```javascript
// Example: Send feedback request after order completion
const templateData = {
  number: customer.phone,
  template: 'customer_feedback_request',
  customTemplate: true,
  components: {
    customer_name: customer.name,
    company_name: 'Your Company',
    service_type: order.service_type,
    service_date: order.completion_date,
    order_id: order.id,
    review_link: `${baseUrl}/review/${order.id}`,
    support_link: `${baseUrl}/support`,
    year: new Date().getFullYear().toString()
  }
};

await fetch('/api/whatsapp', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(templateData)
});
```

## 🔤 Template Variables

### Variable Syntax
Variables use double curly braces: `{{variable_name}}`

### Common Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `customer_name` | Customer's name | "John Doe" |
| `company_name` | Your company name | "Acme Corp" |
| `order_id` | Order/booking ID | "ORD-12345" |
| `service_type` | Type of service | "consultation" |
| `review_link` | Link to review form | "https://example.com/review" |
| `support_link` | Support contact link | "https://example.com/support" |
| `tracking_link` | Order tracking link | "https://example.com/track" |

### Extracting Variables
The system automatically extracts variables from your template text:

```javascript
// Variables are extracted from {{variable_name}} patterns
const body = "Hi {{customer_name}}, your order {{order_id}} is ready!";
// Extracted variables: ["customer_name", "order_id"]
```

## ✅ Best Practices

### 1. Template Naming
- Use lowercase letters and underscores only
- Make names descriptive and unique
- Examples: `customer_feedback_request`, `order_confirmation`

### 2. Message Content
- Keep headers under 60 characters
- Keep body under 1024 characters
- Keep footers under 60 characters
- Use clear, professional language
- Include a clear call-to-action

### 3. Variables
- Use descriptive variable names
- Keep variables simple and reusable
- Test with sample data before sending

### 4. Buttons
- Maximum 2 buttons per template
- Use clear, action-oriented button text
- Ensure URLs are valid and accessible

### 5. Language and Localization
- Start with English templates
- Consider creating localized versions
- Test with native speakers

## 📝 Examples

### Simple Feedback Request
```json
{
  "name": "simple_feedback",
  "description": "Simple feedback request",
  "category": "UTILITY",
  "language": "en",
  "body": "Hi {{customer_name}}, how was your experience with {{company_name}}? Please share your feedback: {{review_link}}",
  "variables": ["customer_name", "company_name", "review_link"]
}
```

### Order Status Update
```json
{
  "name": "order_status",
  "description": "Order status update",
  "category": "UTILITY",
  "language": "en",
  "header": "Order Update - {{company_name}}",
  "body": "Hi {{customer_name}}, your order {{order_id}} status has been updated to {{status}}. Track your order: {{tracking_link}}",
  "footer": "Questions? Contact {{support_phone}}",
  "buttons": [
    {
      "text": "Track Order",
      "url": "{{tracking_link}}"
    }
  ],
  "variables": ["customer_name", "company_name", "order_id", "status", "tracking_link", "support_phone"]
}
```

### Promotional Campaign
```json
{
  "name": "flash_sale",
  "description": "Flash sale promotion",
  "category": "MARKETING",
  "language": "en",
  "header": "Flash Sale Alert! 🎉",
  "body": "Hi {{customer_name}}, {{offer_description}} - {{discount_amount}} off! Use code {{promo_code}} at checkout. Valid until {{expiry_date}}.",
  "footer": "{{company_name}} - Limited time offer",
  "buttons": [
    {
      "text": "Shop Now",
      "url": "{{shop_link}}"
    }
  ],
  "variables": ["customer_name", "offer_description", "discount_amount", "promo_code", "expiry_date", "company_name", "shop_link"]
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Template not found**: Ensure template name is correct and exists
2. **Variable not replaced**: Check variable name spelling and case
3. **Message too long**: Reduce content to fit WhatsApp limits
4. **Button not working**: Verify URL is valid and accessible
5. **Authentication error**: Check your auth token is valid

### Debug Tips

1. Use the test function to verify templates work
2. Check template status in the dashboard
3. Review WhatsApp Business API logs
4. Test with sample data before production use

## 📞 Support

For help with WhatsApp templates:
- Check the dashboard for template status
- Review API documentation
- Contact support with specific error messages
- Test templates in development environment first

---

**Note**: WhatsApp templates must be approved by Meta before they can be used in production. New templates start with "PENDING" status and may take 24-48 hours for approval. 