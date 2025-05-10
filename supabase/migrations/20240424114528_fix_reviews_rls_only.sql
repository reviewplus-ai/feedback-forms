-- Drop existing policies for reviews
DROP POLICY IF EXISTS "Anyone can create reviews" ON public.reviews;
DROP POLICY IF EXISTS "Users can view reviews for their forms" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

-- Create new policies for reviews
CREATE POLICY "Anyone can create reviews"
ON public.reviews FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view reviews"
ON public.reviews FOR SELECT
USING (true); 