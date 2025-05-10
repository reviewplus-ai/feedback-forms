-- Drop existing feedback table
DROP TABLE IF EXISTS feedback CASCADE;

-- Create updated feedback table
CREATE TABLE feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    categories TEXT[] NOT NULL DEFAULT '{}',
    other_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes
CREATE INDEX idx_feedback_review_id ON feedback(review_id);

-- Enable RLS
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Create policies
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

-- Create trigger for updated_at
CREATE TRIGGER update_feedback_updated_at
    BEFORE UPDATE ON feedback
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 