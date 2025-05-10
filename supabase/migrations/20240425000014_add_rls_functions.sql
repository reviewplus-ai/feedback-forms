-- Create a function to disable RLS for the reviews table
CREATE OR REPLACE FUNCTION disable_rls_for_reviews()
RETURNS void AS $$
BEGIN
  ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to enable RLS for the reviews table
CREATE OR REPLACE FUNCTION enable_rls_for_reviews()
RETURNS void AS $$
BEGIN
  ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION disable_rls_for_reviews() TO authenticated;
GRANT EXECUTE ON FUNCTION enable_rls_for_reviews() TO authenticated;

-- Create a policy for public inserts with no restrictions
DROP POLICY IF EXISTS "Allow public inserts" ON reviews;
CREATE POLICY "Allow public inserts"
ON reviews FOR INSERT
WITH CHECK (true);

-- Create a policy for form owners to view their reviews
DROP POLICY IF EXISTS "Allow form owners to view reviews" ON reviews;
CREATE POLICY "Allow form owners to view reviews"
ON reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM review_forms
    WHERE review_forms.id = reviews.form_id
    AND review_forms.user_id = auth.uid()
  )
); 