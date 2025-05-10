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

-- Temporarily disable RLS to allow policy changes
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create a function to insert reviews that bypasses RLS
CREATE OR REPLACE FUNCTION insert_review(
  p_form_id UUID,
  p_rating INTEGER,
  p_comment TEXT,
  p_contact_name TEXT,
  p_contact_email TEXT,
  p_contact_phone TEXT,
  p_feedback_categories JSONB,
  p_feedback_text TEXT
)
RETURNS UUID AS $$
DECLARE
  v_review_id UUID;
BEGIN
  -- Insert the review using SECURITY DEFINER to bypass RLS
  INSERT INTO reviews (
    form_id,
    rating,
    comment,
    contact_name,
    contact_email,
    contact_phone,
    feedback_categories,
    feedback_text,
    is_positive,
    created_at,
    updated_at
  )
  VALUES (
    p_form_id,
    p_rating,
    p_comment,
    p_contact_name,
    p_contact_email,
    p_contact_phone,
    p_feedback_categories,
    p_feedback_text,
    CASE WHEN p_rating >= 4 THEN true ELSE false END,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_review_id;
  
  RETURN v_review_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function to public
GRANT EXECUTE ON FUNCTION insert_review TO public;

-- Create a policy for form owners to view their reviews
CREATE POLICY "Form owners can view their reviews"
ON reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM review_forms
    WHERE review_forms.id = reviews.form_id
    AND review_forms.user_id = auth.uid()
  )
); 