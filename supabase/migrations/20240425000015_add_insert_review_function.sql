-- Create a function to insert a review bypassing RLS
CREATE OR REPLACE FUNCTION insert_review(
  p_form_id UUID,
  p_rating INTEGER,
  p_comment TEXT,
  p_is_positive BOOLEAN
)
RETURNS reviews AS $$
DECLARE
  v_review reviews;
BEGIN
  -- Insert the review directly
  INSERT INTO reviews (form_id, rating, comment, is_positive)
  VALUES (p_form_id, p_rating, p_comment, p_is_positive)
  RETURNING * INTO v_review;
  
  RETURN v_review;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION insert_review(UUID, INTEGER, TEXT, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION insert_review(UUID, INTEGER, TEXT, BOOLEAN) TO anon; 