import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendReviewNotificationToSubscribers } from '@/lib/reviewplus-bot';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    const { formId, review } = await request.json();

    if (!formId || !review) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the form exists
    const { data: form, error: formError } = await supabase
      .from('review_forms')
      .select('id')
      .eq('id', formId)
      .single();

    if (formError || !form) {
      console.error('Error fetching form:', formError);
      return NextResponse.json(
        { error: 'Form not found' },
        { status: 404 }
      );
    }

    // Send notifications to subscribers
    await sendReviewNotificationToSubscribers(formId, review);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
} 