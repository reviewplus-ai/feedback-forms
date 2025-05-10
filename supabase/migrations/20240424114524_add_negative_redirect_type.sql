-- Add negative_redirect_type column to review_forms
ALTER TABLE public.review_forms
ADD COLUMN IF NOT EXISTS negative_redirect_type text NOT NULL DEFAULT 'internal'; 