-- Completely disable RLS on all tables
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE contacts DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies to ensure clean state
DROP POLICY IF EXISTS "Allow inserts" ON reviews;
DROP POLICY IF EXISTS "Allow owner read" ON reviews;
DROP POLICY IF EXISTS "Allow inserts" ON feedback;
DROP POLICY IF EXISTS "Allow owner read" ON feedback;
DROP POLICY IF EXISTS "Allow inserts" ON contacts;
DROP POLICY IF EXISTS "Allow owner read" ON contacts; 