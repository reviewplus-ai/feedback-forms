-- Drop existing tables
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;

-- Create consolidated reviews table
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID NOT NULL REFERENCES review_forms(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    -- Contact information
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    contact_status TEXT DEFAULT 'pending' CHECK (contact_status IN ('pending', 'contacted', 'completed')),
    -- Feedback information
    feedback_categories TEXT[] DEFAULT '{}',
    feedback_text TEXT,
    -- Review metadata
    is_positive BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_reviews_form_id ON reviews(form_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_contact_email ON reviews(contact_email) WHERE contact_email IS NOT NULL;
CREATE INDEX idx_reviews_contact_phone ON reviews(contact_phone) WHERE contact_phone IS NOT NULL;
CREATE INDEX idx_reviews_contact_status ON reviews(contact_status);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
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

-- Create policies for the consolidated table
-- Allow anyone to create reviews
CREATE POLICY "Allow public inserts"
ON reviews FOR INSERT
TO public
WITH CHECK (true);

-- Allow form owners to view their reviews
CREATE POLICY "Allow form owners to view reviews"
ON reviews FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM review_forms
        WHERE review_forms.id = reviews.form_id
        AND review_forms.user_id = auth.uid()
    )
);

-- Allow form owners to update their reviews
CREATE POLICY "Allow form owners to update reviews"
ON reviews FOR UPDATE
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

-- Create function to handle updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 