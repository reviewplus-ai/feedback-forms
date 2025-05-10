-- Add is_positive field to reviews table
ALTER TABLE reviews ADD COLUMN is_positive BOOLEAN;

-- Update existing reviews to set is_positive based on their rating and the form's threshold
UPDATE reviews r
SET is_positive = r.rating >= f.rating_threshold
FROM review_forms f
WHERE r.form_id = f.id;

-- Make is_positive NOT NULL after setting values
ALTER TABLE reviews ALTER COLUMN is_positive SET NOT NULL;

-- Add a default value for new reviews
ALTER TABLE reviews ALTER COLUMN is_positive SET DEFAULT false; 