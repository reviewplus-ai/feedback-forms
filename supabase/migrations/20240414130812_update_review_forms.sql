-- Add new columns to review_forms table
ALTER TABLE public.review_forms
ADD COLUMN negative_redirect_type TEXT DEFAULT 'internal' CHECK (negative_redirect_type IN ('internal', 'external')),
ADD COLUMN negative_feedback_questions JSONB DEFAULT '[
  "What could we improve?",
  "What was the main reason for your negative experience?",
  "Would you like us to contact you to discuss this further?"
]'::jsonb;

-- Create reviews table with enhanced fields
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID REFERENCES public.review_forms(id) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    negative_responses JSONB,
    contact_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for reviews
CREATE INDEX idx_reviews_form_id ON public.reviews(form_id);

-- Enable RLS for reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reviews
CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING (true);

CREATE POLICY "Anyone can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (true);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_review_forms_updated_at
    BEFORE UPDATE ON public.review_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 