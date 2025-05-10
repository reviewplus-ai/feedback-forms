import { Telegraf } from "telegraf";
import type { Update, Message } from "telegraf/types";
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with proper error handling
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || "");

// Bot commands
export const BOT_COMMANDS = {
  START: '/start',
  HELP: '/help',
  SUBSCRIBE: '/subscribe',
  UNSUBSCRIBE: '/unsubscribe',
  STATUS: '/status',
  LIST: '/list'
}

// Bot command descriptions
export const BOT_COMMAND_DESCRIPTIONS = {
  [BOT_COMMANDS.START]: 'Start the ReviewPlus bot',
  [BOT_COMMANDS.HELP]: 'Show help information',
  [BOT_COMMANDS.SUBSCRIBE]: 'Subscribe to review notifications',
  [BOT_COMMANDS.UNSUBSCRIBE]: 'Unsubscribe from review notifications',
  [BOT_COMMANDS.STATUS]: 'Check your subscription status',
  [BOT_COMMANDS.LIST]: 'List all your subscribed forms'
}

interface TelegramUser {
  id: string;
  telegram_user_id: string;
  chat_id: string;
  username?: string;
  is_subscribed: boolean;
  created_at: Date;
  updated_at: Date;
}

interface TelegramFormSubscription {
  id: string;
  telegram_user_id: string;
  form_id: string;
  is_subscribed: boolean;
  created_at: Date;
  updated_at: Date;
}

interface Form {
  id: string;
  name: string;
  company_name: string;
  slug: string;
  rating_threshold: number;
  welcome_message: string;
  thank_you_message: string;
  negative_feedback_questions: string[];
  positive_redirect_url: string | null;
  negative_redirect_url: string | null;
  negative_redirect_type: string;
}

interface TelegramSubscriptionWithUser {
  telegram_user: TelegramUser;
}

interface TelegramSubscription {
  is_subscribed: boolean;
  form: {
    id: string;
    name: string;
    company_name: string;
    slug: string;
  };
}

export async function handleTelegramWebhook(update: Update.MessageUpdate) {
  if (!update.message || !('text' in update.message)) return;

  const message = update.message;
  const chatId = message.chat.id;
  const text = message.text;

  try {
    if (!message.from) {
      await sendTelegramMessage(chatId, '❌ Could not process your request. Please try again.');
      return;
    }

    const telegramUserId = message.from.id.toString();

    // Get or create user
    let user = await getOrCreateUser(telegramUserId, chatId.toString(), message.from.username);

    // Handle commands
    if (text.startsWith('/')) {
      const [command, ...args] = text.split(' ');
      
      switch (command) {
        case '/start':
          await sendTelegramMessage(chatId, 
            'Welcome to ReviewPlus Bot! 🎉\n\n' +
            'Use /subscribe <form_id> to subscribe to a specific form\n' +
            'Use /unsubscribe <form_id> to unsubscribe from a form\n' +
            'Use /help to see all available commands'
          );
          break;

        case '/subscribe':
          if (args.length === 0) {
            await sendTelegramMessage(chatId, '❌ Please provide a form ID. Usage: /subscribe <form_id>');
            return;
          }

          const formId = args[0];
          
          // Get form details with explicit field selection
          const { data: form, error: formError } = await supabase
            .from('review_forms')
            .select('id, name, company_name, slug, rating_threshold, welcome_message, positive_redirect_url, negative_redirect_url, negative_redirect_type, negative_feedback_questions')
            .eq('id', formId)
            .single();

          if (formError) {
            console.error('Error fetching form:', formError);
            await sendTelegramMessage(chatId, '❌ Error accessing form. Please check the form ID and try again.');
            return;
          }

          if (!form) {
            await sendTelegramMessage(chatId, '❌ Form not found. Please check the form ID and try again.');
            return;
          }

          // Check if already subscribed
          const { data: existingSubscription, error: checkError } = await supabase
            .from('telegram_form_subscriptions')
            .select('is_subscribed')
            .eq('telegram_user_id', user.id)
            .eq('form_id', form.id)
            .single();

          if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
            console.error('Error checking subscription:', checkError);
            await sendTelegramMessage(chatId, '❌ Error checking subscription status. Please try again later.');
            return;
          }

          if (existingSubscription?.is_subscribed) {
            await sendTelegramMessage(chatId, 'ℹ️ You are already subscribed to this form.');
            return;
          }

          // If subscription exists but is unsubscribed, update it
          if (existingSubscription) {
            const { error: updateError } = await supabase
              .from('telegram_form_subscriptions')
              .update({ is_subscribed: true })
              .eq('telegram_user_id', user.id)
              .eq('form_id', form.id);

            if (updateError) {
              console.error('Error updating subscription:', updateError);
              await sendTelegramMessage(chatId, '❌ Error subscribing to form. Please try again later.');
              return;
            }
          } else {
            // Create new subscription if it doesn't exist
            const { error: insertError } = await supabase
              .from('telegram_form_subscriptions')
              .insert({
                telegram_user_id: user.id,
                form_id: form.id,
                is_subscribed: true
              });

            if (insertError) {
              console.error('Error creating subscription:', insertError);
              await sendTelegramMessage(chatId, '❌ Error subscribing to form. Please try again later.');
              return;
            }
          }

          // Send success message with form details
          const formDetails = `✅ Successfully subscribed to form!\n\n` +
            `📝 Form Details:\n` +
            `• Name: ${form.name}\n` +
            `• Company: ${form.company_name}\n` +
            `• URL: ${process.env.NEXT_PUBLIC_SITE_URL}/review/${form.slug}\n` +
            `• Rating Threshold: ${form.rating_threshold}+ stars\n` +
            `• Welcome Message: ${form.welcome_message}\n` +
            (form.positive_redirect_url ? `• Positive Review Redirect: ${form.positive_redirect_url}\n` : '') +
            (form.negative_redirect_url ? `• Negative Review Redirect: ${form.negative_redirect_url}\n` : '') +
            (form.negative_redirect_type === 'internal' 
              ? `• Negative Reviews: Negative Feedback Options:\n${(form.negative_feedback_questions as string[]).map((q: string) => `  - ${q}`).join('\n')}\n` 
              : '• Negative Reviews: Redirects to external URL\n') +
            `\nYou'll now receive notifications for new reviews on this form.`;

          await sendTelegramMessage(chatId, formDetails);
          break;

        case '/unsubscribe':
          if (args.length === 0) {
            await sendTelegramMessage(chatId, '❌ Please provide a form ID. Usage: /unsubscribe <form_id>');
            return;
          }

          const unsubscribeFormId = args[0];
          
          // First check if the form exists
          const { data: unsubscribeForm, error: unsubscribeFormError } = await supabase
            .from('review_forms')
            .select('id, name')
            .eq('id', unsubscribeFormId)
            .single();

          if (unsubscribeFormError) {
            console.error('Error fetching form:', unsubscribeFormError);
            await sendTelegramMessage(chatId, '❌ Error accessing form. Please check the form ID and try again.');
            return;
          }

          if (!unsubscribeForm) {
            await sendTelegramMessage(chatId, '❌ Form not found. Please check the form ID and try again.');
            return;
          }

          // Check if the subscription exists
          const { data: unsubscribeSubscription, error: unsubscribeCheckError } = await supabase
            .from('telegram_form_subscriptions')
            .select('is_subscribed')
            .eq('telegram_user_id', user.id)
            .eq('form_id', unsubscribeFormId)
            .single();

          if (unsubscribeCheckError && unsubscribeCheckError.code !== 'PGRST116') { // PGRST116 is "not found" error
            console.error('Error checking subscription:', unsubscribeCheckError);
            await sendTelegramMessage(chatId, '❌ Error checking subscription status. Please try again later.');
            return;
          }

          if (!unsubscribeSubscription) {
            await sendTelegramMessage(chatId, 'ℹ️ You are not subscribed to this form.');
            return;
          }

          if (!unsubscribeSubscription.is_subscribed) {
            await sendTelegramMessage(chatId, 'ℹ️ You are already unsubscribed from this form.');
            return;
          }
          
          // Unsubscribe from the form
          const { error: unsubscribeError } = await supabase
            .from('telegram_form_subscriptions')
            .update({ is_subscribed: false })
            .eq('telegram_user_id', user.id)
            .eq('form_id', unsubscribeFormId);

          if (unsubscribeError) {
            console.error('Error unsubscribing from form:', unsubscribeError);
            await sendTelegramMessage(chatId, '❌ Error unsubscribing from form. Please try again later.');
            return;
          }

          await sendTelegramMessage(chatId, `✅ Successfully unsubscribed from form "${unsubscribeForm.name}".`);
          break;

        case '/list':
          // Get all subscribed forms for the user
          const { data: subscriptions, error: listError } = await supabase
            .from('telegram_form_subscriptions')
            .select(`
              is_subscribed,
              form:review_forms (
                id,
                name,
                company_name,
                slug
              )
            `)
            .eq('telegram_user_id', user.id)
            .eq('is_subscribed', true) as { data: TelegramSubscription[] | null, error: any };

          if (listError) {
            console.error('Error fetching subscriptions:', listError);
            await sendTelegramMessage(chatId, '❌ Error fetching your subscriptions. Please try again later.');
            return;
          }

          if (!subscriptions || subscriptions.length === 0) {
            await sendTelegramMessage(chatId, '📝 You are not subscribed to any forms yet.\n\nUse /subscribe <form_id> to subscribe to a form.');
            return;
          }

          // Format the list of subscribed forms
          const formList = subscriptions
            .map(sub => {
              const form = sub.form;
              return `• ${form.name} (${form.company_name})\n  ID: ${form.id}\n  URL: ${process.env.NEXT_PUBLIC_SITE_URL}/review/${form.slug}`;
            })
            .join('\n\n');

          await sendTelegramMessage(chatId, 
            '📋 Your Subscribed Forms:\n\n' +
            formList +
            '\n\nUse /unsubscribe <form_id> to unsubscribe from a form.'
          );
          break;

        case '/help':
          await sendTelegramMessage(chatId,
            'Available commands:\n\n' +
            '/start - Start the bot\n' +
            '/subscribe <form_id> - Subscribe to a specific form\n' +
            '/unsubscribe <form_id> - Unsubscribe from a specific form\n' +
            '/list - Show all your subscribed forms\n' +
            '/help - Show this help message'
          );
          break;
      }
    }
  } catch (error) {
    console.error('Error handling Telegram webhook:', error);
    await sendTelegramMessage(chatId, '❌ An error occurred. Please try again later.');
  }
}

async function getOrCreateUser(telegramUserId: string, chatId: string, username?: string): Promise<TelegramUser> {
  // Try to get existing user
  const { data: existingUser, error: getUserError } = await supabase
    .from('telegram_users')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .single();

  if (getUserError && getUserError.code !== 'PGRST116') { // PGRST116 is "not found" error
    console.error('Error fetching user:', getUserError);
    throw getUserError;
  }

  if (existingUser) {
    return existingUser;
  }

  // Create new user if not found
  const { data: newUser, error: createError } = await supabase
    .from('telegram_users')
    .insert({
      telegram_user_id: telegramUserId,
      chat_id: chatId,
      username: username,
      is_subscribed: false
    })
    .select()
    .single();

  if (createError) {
    console.error('Error creating user:', createError);
    throw createError;
  }

  return newUser;
}

async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options: { parse_mode?: 'HTML' | 'Markdown' } = {}
): Promise<void> {
  try {
    await bot.telegram.sendMessage(chatId, text, { ...(options as any), disable_web_page_preview: true });
  } catch (error) {
    console.error('Error sending Telegram message:', error);
    throw error;
  }
}

interface Review {
  rating: number;
  comment?: string;
  contact_details?: string;
  name?: string;
  negative_responses?: string[];
  other_feedback?: string;
}

export async function sendReviewNotificationToSubscribers(formId: string, review: Review) {
  try {
    // Get form details
    const { data: form, error: formError } = await supabase
      .from('review_forms')
      .select('id, name, company_name, slug, rating_threshold, welcome_message, positive_redirect_url, negative_redirect_url, negative_redirect_type')
      .eq('id', formId)
      .single();

    if (formError) {
      console.error('Error fetching form:', formError);
      return;
    }

    if (!form) {
      console.error('Form not found:', formId);
      return;
    }

    // Get subscribers for this form
    const { data: subscriptions, error: subscriptionError } = await supabase
      .from('telegram_form_subscriptions')
      .select('telegram_user:telegram_users(*)')
      .eq('form_id', formId)
      .eq('is_subscribed', true) as { data: TelegramSubscriptionWithUser[] | null, error: any };

    if (subscriptionError) {
      console.error('Error fetching subscriptions:', subscriptionError);
      return;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No subscribers found for form:', formId);
      return;
    }

    // Prepare notification message with more details
    const message = `📝 New Review Received!\n\n` +
      `Form: ${form.name}\n` +
      `Company: ${form.company_name}\n` +
      `Rating: ${'⭐'.repeat(review.rating)} (${review.rating}/5)\n` +
      (review.comment ? `\n💬 Comment:\n${review.comment}\n` : '') +
      (review.negative_responses && review.negative_responses.length > 0 
        ? `\n📋 Feedback:\n${review.negative_responses.map((category: string) => `  - ${category}`).join('\n')}\n` 
        : '') +
      ((review.name && review.name.trim()) || (review.contact_details && review.contact_details.trim()) 
        ? `\n👤 Contact Information:\n${review.name && review.name.trim() ? `Name: ${review.name}\n` : ''}${review.contact_details && review.contact_details.trim() ? `Contact: ${review.contact_details}\n` : ''}` 
        : '') +
      `\n🔗 View Form: ${process.env.NEXT_PUBLIC_SITE_URL}/review/${form.slug}`;

    // Send notifications to all subscribers
    for (const subscription of subscriptions) {
      if (subscription.telegram_user && subscription.telegram_user.chat_id) {
        try {
          await sendTelegramMessage(subscription.telegram_user.chat_id, message);
        } catch (error) {
          console.error(`Error sending notification to chat_id ${subscription.telegram_user.chat_id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error sending review notifications:', error);
  }
}
