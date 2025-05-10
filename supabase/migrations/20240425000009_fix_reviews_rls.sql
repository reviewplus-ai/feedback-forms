-- Drop all existing policies for reviews
DROP POLICY IF EXISTS "Allow public insert access" ON reviews;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON reviews;
DROP POLICY IF EXISTS "Allow owner read access" ON reviews;
DROP POLICY IF EXISTS "Anyone can create reviews" ON reviews;
DROP POLICY IF EXISTS "Form owners can view their reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Form owners have full access to their reviews" ON reviews;
DROP POLICY IF EXISTS "Form owners can manage their reviews" ON reviews;
DROP POLICY IF EXISTS "Allow inserts" ON reviews;
DROP POLICY IF EXISTS "Allow owner read" ON reviews;

-- Temporarily disable RLS
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create a single policy for public inserts
CREATE POLICY "Anyone can create reviews"
ON reviews FOR INSERT
WITH CHECK (true);

-- Create a single policy for form owners to view their reviews
CREATE POLICY "Form owners can view their reviews"
ON reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM review_forms
    WHERE review_forms.id = reviews.form_id
    AND review_forms.user_id = auth.uid()
  )
); 