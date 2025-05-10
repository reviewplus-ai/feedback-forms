-- Drop existing policies
DROP POLICY IF EXISTS "Allow public insert access" ON reviews;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON reviews;
DROP POLICY IF EXISTS "Allow owner read access" ON reviews;
DROP POLICY IF EXISTS "Anyone can create reviews" ON reviews;
DROP POLICY IF EXISTS "Form owners can view their reviews" ON reviews;
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
DROP POLICY IF EXISTS "Form owners have full access to their reviews" ON reviews;
DROP POLICY IF EXISTS "Form owners can manage their reviews" ON reviews;
DROP POLICY IF EXISTS "Allow public insert access" ON feedback;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON feedback;
DROP POLICY IF EXISTS "Allow owner read access" ON feedback;
DROP POLICY IF EXISTS "Anyone can create feedback" ON feedback;
DROP POLICY IF EXISTS "Form owners have full access to their feedback" ON feedback;
DROP POLICY IF EXISTS "Form owners can manage their feedback" ON feedback;
DROP POLICY IF EXISTS "Allow public insert access" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON contacts;
DROP POLICY IF EXISTS "Allow owner read access" ON contacts;
DROP POLICY IF EXISTS "Anyone can create contacts" ON contacts;
DROP POLICY IF EXISTS "Form owners have full access to their contacts" ON contacts;
DROP POLICY IF EXISTS "Form owners can manage their contacts" ON contacts;

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
DROP TRIGGER IF EXISTS update_feedback_updated_at ON feedback;
DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;
DROP TRIGGER IF EXISTS update_review_forms_updated_at ON review_forms;

-- Temporarily disable RLS to allow inserts
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for reviews
-- Allow anyone to create reviews (for the review form)
CREATE POLICY "Anyone can create reviews"
ON reviews FOR INSERT
WITH CHECK (true);

-- Allow form owners to view and manage their reviews
CREATE POLICY "Form owners can manage their reviews"
ON reviews FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM review_forms
    WHERE review_forms.id = reviews.form_id
    AND review_forms.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM review_forms
    WHERE review_forms.id = reviews.form_id
    AND review_forms.user_id = auth.uid()
  )
);

-- Create policies for feedback
-- Allow anyone to create feedback (for the review form)
CREATE POLICY "Anyone can create feedback"
ON feedback FOR INSERT
WITH CHECK (true);

-- Allow form owners to view and manage their feedback
CREATE POLICY "Form owners can manage their feedback"
ON feedback FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM reviews
    JOIN review_forms ON review_forms.id = reviews.form_id
    WHERE reviews.id = feedback.review_id
    AND review_forms.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM reviews
    JOIN review_forms ON review_forms.id = reviews.form_id
    WHERE reviews.id = feedback.review_id
    AND review_forms.user_id = auth.uid()
  )
);

-- Create policies for contacts
-- Allow anyone to create contacts (for the review form)
CREATE POLICY "Anyone can create contacts"
ON contacts FOR INSERT
WITH CHECK (true);

-- Allow form owners to view and manage their contacts
CREATE POLICY "Form owners can manage their contacts"
ON contacts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM reviews
    JOIN review_forms ON review_forms.id = reviews.form_id
    WHERE reviews.id = contacts.review_id
    AND review_forms.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM reviews
    JOIN review_forms ON review_forms.id = reviews.form_id
    WHERE reviews.id = contacts.review_id
    AND review_forms.user_id = auth.uid()
  )
);

-- Create function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_forms_updated_at
  BEFORE UPDATE ON review_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 