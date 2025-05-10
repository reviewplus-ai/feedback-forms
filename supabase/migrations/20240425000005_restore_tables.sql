-- Drop consolidated table if it exists
DROP TABLE IF EXISTS reviews;

-- Create reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES review_forms(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create feedback table
CREATE TABLE feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  categories JSONB NOT NULL,
  other_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create contacts table
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX reviews_form_id_idx ON reviews(form_id);
CREATE INDEX reviews_rating_idx ON reviews(rating);
CREATE INDEX feedback_review_id_idx ON feedback(review_id);
CREATE INDEX contacts_review_id_idx ON contacts(review_id);
CREATE INDEX contacts_status_idx ON contacts(status);

-- Enable RLS on all tables
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public insert access" ON reviews;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON reviews;
DROP POLICY IF EXISTS "Allow owner read access" ON reviews;
DROP POLICY IF EXISTS "Allow public insert access" ON feedback;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON feedback;
DROP POLICY IF EXISTS "Allow owner read access" ON feedback;
DROP POLICY IF EXISTS "Allow public insert access" ON contacts;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON contacts;
DROP POLICY IF EXISTS "Allow owner read access" ON contacts;

-- Create policies for reviews table
CREATE POLICY "Allow public insert access" ON reviews
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Allow authenticated insert access" ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow owner read access" ON reviews
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM review_forms
      WHERE review_forms.id = reviews.form_id
      AND review_forms.user_id = auth.uid()
    )
  );

-- Create policies for feedback table
CREATE POLICY "Allow public insert access" ON feedback
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Allow authenticated insert access" ON feedback
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow owner read access" ON feedback
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews
      JOIN review_forms ON review_forms.id = reviews.form_id
      WHERE reviews.id = feedback.review_id
      AND review_forms.user_id = auth.uid()
    )
  );

-- Create policies for contacts table
CREATE POLICY "Allow public insert access" ON contacts
  FOR INSERT TO public
  WITH CHECK (true);

CREATE POLICY "Allow authenticated insert access" ON contacts
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow owner read access" ON contacts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM reviews
      JOIN review_forms ON review_forms.id = reviews.form_id
      WHERE reviews.id = contacts.review_id
      AND review_forms.user_id = auth.uid()
    )
  );

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

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