-- First, update the reviews table to ensure it has a comment field
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS comment TEXT;

-- Update the feedback table to remove the other_feedback field
ALTER TABLE feedback 
DROP COLUMN IF EXISTS other_feedback;

-- Create a function to migrate existing data
CREATE OR REPLACE FUNCTION migrate_comments_to_reviews()
RETURNS void AS $$
DECLARE
  feedback_record RECORD;
BEGIN
  -- Loop through all feedback records with other_feedback
  FOR feedback_record IN 
    SELECT f.id, f.review_id, f.other_feedback 
    FROM feedback f 
    WHERE f.other_feedback IS NOT NULL AND f.other_feedback != ''
  LOOP
    -- Update the corresponding review with the comment
    UPDATE reviews 
    SET comment = feedback_record.other_feedback
    WHERE id = feedback_record.review_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the migration function
SELECT migrate_comments_to_reviews();

-- Drop the migration function after use
DROP FUNCTION migrate_comments_to_reviews(); 