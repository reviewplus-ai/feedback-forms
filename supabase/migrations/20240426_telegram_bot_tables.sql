-- Create telegram_users table
CREATE TABLE IF NOT EXISTS public.telegram_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id TEXT NOT NULL UNIQUE,
  chat_id TEXT NOT NULL,
  username TEXT,
  is_subscribed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create telegram_form_subscriptions table
CREATE TABLE IF NOT EXISTS public.telegram_form_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_user_id UUID NOT NULL REFERENCES public.telegram_users(id) ON DELETE CASCADE,
  form_id UUID NOT NULL REFERENCES public.review_forms(id) ON DELETE CASCADE,
  is_subscribed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(telegram_user_id, form_id)
);

-- Create RLS policies for telegram_users
ALTER TABLE public.telegram_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to telegram_users"
  ON public.telegram_users
  FOR SELECT
  USING (true);

CREATE POLICY "Allow self-insert to telegram_users"
  ON public.telegram_users
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow self-update to telegram_users"
  ON public.telegram_users
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create RLS policies for telegram_form_subscriptions
ALTER TABLE public.telegram_form_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to telegram_form_subscriptions"
  ON public.telegram_form_subscriptions
  FOR SELECT
  USING (true);

CREATE POLICY "Allow self-insert to telegram_form_subscriptions"
  ON public.telegram_form_subscriptions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow self-update to telegram_form_subscriptions"
  ON public.telegram_form_subscriptions
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_telegram_users
  BEFORE UPDATE ON public.telegram_users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_telegram_form_subscriptions
  BEFORE UPDATE ON public.telegram_form_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at(); 