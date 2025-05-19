import { NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';

// Telegram configuration from environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_QUOTE_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_QUOTE_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN) {
  console.error('Missing TELEGRAM_QUOTE_BOT_TOKEN in environment variables');
  throw new Error('Missing TELEGRAM_QUOTE_BOT_TOKEN');
}
if (!TELEGRAM_CHAT_ID) {
  console.error('Missing TELEGRAM_QUOTE_CHAT_ID in environment variables');
  throw new Error('Missing TELEGRAM_QUOTE_CHAT_ID');
}

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

/**
 * Send message to Telegram using Telegraf with retry logic
 */
async function sendTelegramMessage(chatId: string | number, text: string, maxRetries = 3): Promise<void> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt} to send message to Telegram...`);
      await bot.telegram.sendMessage(chatId, text, { parse_mode: 'HTML' });
      console.log('Successfully sent message to Telegram');
      return;
    } catch (error: any) {
      lastError = error;
      console.error(`Attempt ${attempt} failed:`, {
        message: error.message,
        code: error.code,
        cause: error.cause
      });
      
      if (attempt < maxRetries) {
        // Exponential backoff: wait longer between each retry
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Failed to send message after ${maxRetries} attempts. Last error: ${lastError?.message}`);
}

/**
 * Create a fallback record for failed requests
 */
async function createFallbackRecord(data: any, error: any): Promise<string> {
  const referenceId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
  
  console.error(`Failed quote request (${referenceId}):`, {
    data,
    error: {
      message: error.message,
      name: error.name,
      code: error.code || (error.cause && error.cause.code),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    },
    timestamp: new Date().toISOString()
  });
  
  return referenceId;
}

/**
 * Handle POST requests for quote submissions
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { name, email, phone, company, businessType, message } = data;
    
    // Validate required fields
    if (!name || !email || !phone || !company || !businessType) {
      return NextResponse.json(
        { error: 'Name, email, phone, company, and business type are required' },
        { status: 400 }
      );
    }
    
    // Format the message for Telegram
    const telegramMessage = `
<b>🆕 New Quote Request</b>

<b>👤 Name:</b> ${name}
<b>📧 Email:</b> ${email}
<b>📱 Phone:</b> ${phone}
<b>🏢 Company:</b> ${company}
<b>🏪 Business Type:</b> ${businessType}
${message ? `\n<b>📝 Message:</b>\n${message}` : ''}

<b>⏰ Submitted:</b> ${new Date().toLocaleString()}
`;

    try {
      await sendTelegramMessage(TELEGRAM_CHAT_ID as string, telegramMessage);
      return NextResponse.json({ 
        success: true,
        message: 'Quote request submitted successfully'
      });
    } catch (error: any) {
      console.error('Telegram API error:', error);
      const referenceId = await createFallbackRecord(data, error);
      
      // Return success to user even if Telegram fails
      return NextResponse.json({ 
        success: true,
        message: 'Quote request submitted successfully',
        referenceId,
        note: 'Your request has been received. We will contact you shortly.'
      });
    }
  } catch (error: any) {
    console.error('Quote submission error:', error);
    return NextResponse.json(
      { error: 'Invalid request format' },
      { status: 400 }
    );
  }
}