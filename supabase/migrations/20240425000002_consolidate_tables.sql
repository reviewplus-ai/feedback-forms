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
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_reviews_form_id ON reviews(form_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_contact_email ON reviews(contact_email) WHERE contact_email IS NOT NULL;
CREATE INDEX idx_reviews_contact_phone ON reviews(contact_phone) WHERE contact_phone IS NOT NULL;

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Enable insert for authenticated and anonymous users" ON reviews;
DROP POLICY IF EXISTS "Enable select for form owners" ON reviews;
DROP POLICY IF EXISTS "Enable read access for form owners" ON reviews;
DROP POLICY IF EXISTS "Enable insert access for all" ON reviews;
DROP POLICY IF EXISTS "Allow anonymous insert" ON reviews;
DROP POLICY IF EXISTS "Allow authenticated insert" ON reviews;
DROP POLICY IF EXISTS "Allow form owners to view reviews" ON reviews;

-- Create simplified policies
CREATE POLICY "Enable public insert access" ON reviews
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable owner read access" ON reviews
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND (
            EXISTS (
                SELECT 1 FROM review_forms
                WHERE review_forms.id = reviews.form_id
                AND review_forms.user_id = auth.uid()
            )
        )
    );

-- Create trigger for updated_at
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 