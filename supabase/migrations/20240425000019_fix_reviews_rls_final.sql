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
DROP POLICY IF EXISTS "Allow public inserts" ON reviews;
DROP POLICY IF EXISTS "Allow form owners to view reviews" ON reviews;

-- Temporarily disable RLS to allow inserts
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create a policy for public inserts with no restrictions
CREATE POLICY "Allow public inserts"
ON reviews FOR INSERT
TO public
WITH CHECK (true);

-- Create a policy for public updates with no restrictions
CREATE POLICY "Allow public updates"
ON reviews FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Create a policy for form owners to view their reviews
CREATE POLICY "Allow form owners to view reviews"
ON reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM review_forms
    WHERE review_forms.id = reviews.form_id
    AND review_forms.user_id = auth.uid()
  )
); 