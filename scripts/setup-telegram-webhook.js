#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://your-domain.com/api/telegram/webhook';

if (!TELEGRAM_BOT_TOKEN) {
  console.error('Error: TELEGRAM_BOT_TOKEN is not set in your .env file');
  process.exit(1);
}

if (!WEBHOOK_URL || WEBHOOK_URL === 'https://your-domain.com/api/telegram/webhook') {
  console.error('Error: WEBHOOK_URL is not set in your .env file or is using the default value');
  console.error('Please set WEBHOOK_URL to your actual domain in the .env file');
  process.exit(1);
}

console.log(`Setting up Telegram webhook for bot ${TELEGRAM_BOT_TOKEN.split(':')[0]}...`);
console.log(`Webhook URL: ${WEBHOOK_URL}`);

const options = {
  hostname: 'api.telegram.org',
  path: `/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
};

const data = JSON.stringify({
  url: WEBHOOK_URL,
  max_connections: 100,
});

const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(responseData);
      if (response.ok) {
        console.log('✅ Webhook set successfully!');
        console.log('Response:', response);
      } else {
        console.error('❌ Failed to set webhook:');
        console.error(response);
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('Error setting webhook:', error);
});

req.write(data);
req.end(); 