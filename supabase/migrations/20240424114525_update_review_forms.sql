-- Drop existing tables if they exist
DROP TABLE IF EXISTS review_forms CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS contacts CASCADE;

-- Create review_forms table
CREATE TABLE review_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    company_name TEXT NOT NULL,
    welcome_message TEXT NOT NULL DEFAULT 'How was your experience with us?',
    thank_you_message TEXT NOT NULL DEFAULT 'Thank you for your feedback!',
    rating_threshold INTEGER NOT NULL DEFAULT 4,
    positive_redirect_url TEXT,
    negative_redirect_url TEXT,
    negative_redirect_type TEXT NOT NULL DEFAULT 'internal',
    negative_feedback_questions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create reviews table
CREATE TABLE reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    form_id UUID NOT NULL REFERENCES review_forms(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create feedback table
CREATE TABLE feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create contacts table
CREATE TABLE contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_review_forms_user_id ON review_forms(user_id);
CREATE INDEX idx_review_forms_slug ON review_forms(slug);
CREATE INDEX idx_reviews_form_id ON reviews(form_id);
CREATE INDEX idx_feedback_review_id ON feedback(review_id);
CREATE INDEX idx_contacts_review_id ON contacts(review_id);

-- Enable Row Level Security
ALTER TABLE review_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own forms"
    ON review_forms FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own forms"
    ON review_forms FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own forms"
    ON review_forms FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own forms"
    ON review_forms FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can create reviews"
    ON reviews FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view reviews for their forms"
    ON reviews FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM review_forms
        WHERE review_forms.id = reviews.form_id
        AND review_forms.user_id = auth.uid()
    ));

CREATE POLICY "Anyone can create feedback"
    ON feedback FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view feedback for their forms"
    ON feedback FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM reviews
        JOIN review_forms ON review_forms.id = reviews.form_id
        WHERE reviews.id = feedback.review_id
        AND review_forms.user_id = auth.uid()
    ));

CREATE POLICY "Anyone can create contact requests"
    ON contacts FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view contact requests for their forms"
    ON contacts FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM reviews
        JOIN review_forms ON review_forms.id = reviews.form_id
        WHERE reviews.id = contacts.review_id
        AND review_forms.user_id = auth.uid()
    ));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_review_forms_updated_at
    BEFORE UPDATE ON review_forms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 