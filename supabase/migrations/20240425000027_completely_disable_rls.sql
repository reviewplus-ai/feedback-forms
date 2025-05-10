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
DROP POLICY IF EXISTS "Anyone can submit reviews" ON reviews;
DROP POLICY IF EXISTS "Form owners can view their reviews" ON reviews;

-- Completely disable RLS for the reviews table
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to public role
GRANT ALL ON reviews TO public;

-- Create a function to check if a user can view a review
CREATE OR REPLACE FUNCTION can_view_review(review_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- If the user is authenticated and owns the form, they can view the review
  IF auth.uid() IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM reviews r
      JOIN review_forms rf ON r.form_id = rf.id
      WHERE r.id = review_id AND rf.user_id = auth.uid()
    );
  END IF;
  
  -- By default, no one can view reviews
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view that only shows reviews to form owners
CREATE OR REPLACE VIEW reviews_for_owners AS
SELECT r.*
FROM reviews r
JOIN review_forms rf ON r.form_id = rf.id
WHERE rf.user_id = auth.uid();

-- Grant select on the view to authenticated users
GRANT SELECT ON reviews_for_owners TO authenticated; 