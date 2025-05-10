import { NextRequest, NextResponse } from 'next/server';
import { handleTelegramWebhook } from '@/lib/reviewplus-bot';

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    console.log('Received Telegram update:', JSON.stringify(update, null, 2));
    
    // Handle the Telegram webhook update
    await handleTelegramWebhook(update);
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
} 