-- Add new columns for negative review handling
ALTER TABLE public.review_forms
ADD COLUMN IF NOT EXISTS negative_redirect_type text NOT NULL DEFAULT 'internal',
ADD COLUMN IF NOT EXISTS negative_redirect_url text,
ADD COLUMN IF NOT EXISTS negative_feedback_questions jsonb NOT NULL DEFAULT '["What could we improve?", "What was the main reason for your negative experience?", "Would you like us to contact you to discuss this further?"]';

-- Add new columns for reviews
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS negative_responses jsonb,
ADD COLUMN IF NOT EXISTS contact_details text; 