-- Enable RLS on companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for companies
CREATE POLICY "Anyone can create companies"
ON public.companies FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view companies"
ON public.companies FOR SELECT
USING (true);

-- Enable RLS on review_forms table
ALTER TABLE public.review_forms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for review_forms
CREATE POLICY "Anyone can create review forms"
ON public.review_forms FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view review forms"
ON public.review_forms FOR SELECT
USING (true);

-- Update reviews table RLS policies
DROP POLICY IF EXISTS "Form owners can view their reviews" ON public.reviews;

CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING (true); 