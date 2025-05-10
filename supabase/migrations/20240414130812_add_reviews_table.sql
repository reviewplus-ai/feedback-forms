-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES public.review_forms(id) NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for form_id
CREATE INDEX IF NOT EXISTS idx_reviews_form_id ON public.reviews(form_id);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Anyone can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (true);

CREATE POLICY "Form owners can view their reviews"
ON public.reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.review_forms
    WHERE review_forms.id = reviews.form_id
    AND review_forms.user_id = auth.uid()
  )
); 