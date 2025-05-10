-- Enable RLS
ALTER TABLE public.review_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their forms" ON public.review_forms;
DROP POLICY IF EXISTS "Users can create forms" ON public.review_forms;
DROP POLICY IF EXISTS "Users can update their forms" ON public.review_forms;

-- Create new policies
CREATE POLICY "Anyone can view review forms"
ON public.review_forms FOR SELECT
USING (true);

CREATE POLICY "Users can create forms"
ON public.review_forms FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their forms"
ON public.review_forms FOR UPDATE
USING (auth.uid() = user_id);

-- Drop existing policies for companies
DROP POLICY IF EXISTS "Users can view their company's data" ON public.companies;
DROP POLICY IF EXISTS "Users can create companies" ON public.companies;

-- Create new policies for companies
CREATE POLICY "Anyone can view companies"
ON public.companies FOR SELECT
USING (true);

CREATE POLICY "Users can create companies"
ON public.companies FOR INSERT
WITH CHECK (auth.uid() = user_id); 