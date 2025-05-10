-- Drop existing tables
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS reviews;

-- Create consolidated reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES review_forms(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_status TEXT DEFAULT 'pending' CHECK (contact_status IN ('pending', 'contacted', 'completed')),
  feedback_categories JSONB,
  feedback_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX reviews_form_id_idx ON reviews(form_id);
CREATE INDEX reviews_rating_idx ON reviews(rating);
CREATE INDEX reviews_contact_status_idx ON reviews(contact_status);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public insert access" ON reviews;
DROP POLICY IF EXISTS "Allow authenticated insert access" ON reviews;
DROP POLICY IF EXISTS "Allow owner read access" ON reviews;

-- Create simplified policies
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

-- Create updated_at trigger
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