-- Enable RLS on all tables
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow inserts" ON reviews;
DROP POLICY IF EXISTS "Allow owner read" ON reviews;
DROP POLICY IF EXISTS "Allow inserts" ON feedback;
DROP POLICY IF EXISTS "Allow owner read" ON feedback;
DROP POLICY IF EXISTS "Allow inserts" ON contacts;
DROP POLICY IF EXISTS "Allow owner read" ON contacts;

-- Create policies for reviews table
CREATE POLICY "Allow inserts" ON reviews
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow owner read" ON reviews
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM review_forms
      WHERE review_forms.id = reviews.form_id
      AND review_forms.user_id = auth.uid()
    )
  );

-- Create policies for feedback table
CREATE POLICY "Allow inserts" ON feedback
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow owner read" ON feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reviews
      JOIN review_forms ON review_forms.id = reviews.form_id
      WHERE reviews.id = feedback.review_id
      AND review_forms.user_id = auth.uid()
    )
  );

-- Create policies for contacts table
CREATE POLICY "Allow inserts" ON contacts
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow owner read" ON contacts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM reviews
      JOIN review_forms ON review_forms.id = reviews.form_id
      WHERE reviews.id = contacts.review_id
      AND review_forms.user_id = auth.uid()
    )
  ); 