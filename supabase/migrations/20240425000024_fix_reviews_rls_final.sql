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
DROP POLICY IF EXISTS "Allow public updates" ON reviews;
DROP POLICY IF EXISTS "Allow form owners to update reviews" ON reviews;

-- Temporarily disable RLS to allow inserts
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions to public role
GRANT INSERT ON reviews TO public;
GRANT SELECT ON reviews TO public;

-- Create a policy for public inserts with basic validation
CREATE POLICY "Allow public inserts"
ON reviews FOR INSERT
TO public
WITH CHECK (
  -- Ensure form_id exists
  EXISTS (
    SELECT 1 FROM review_forms
    WHERE review_forms.id = form_id
  )
  -- Ensure rating is within valid range
  AND rating >= 1 
  AND rating <= 5
  -- Ensure required fields are present
  AND form_id IS NOT NULL
  AND rating IS NOT NULL
);

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