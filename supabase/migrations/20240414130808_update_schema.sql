-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.review_forms CASCADE;
DROP TABLE IF EXISTS public.companies CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT NOT NULL,
    company_id UUID,
    is_google_workspace BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT,
    is_google_workspace BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create review_forms table
CREATE TABLE IF NOT EXISTS public.review_forms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    welcome_message TEXT,
    thank_you_message TEXT,
    rating_threshold INTEGER DEFAULT 4,
    positive_redirect_url TEXT,
    negative_redirect_url TEXT,
    enable_comments BOOLEAN DEFAULT TRUE,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    company_id UUID REFERENCES public.companies(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add foreign key constraint to users table
ALTER TABLE public.users
ADD CONSTRAINT fk_company
FOREIGN KEY (company_id)
REFERENCES public.companies(id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_company_id ON public.users(company_id);
CREATE INDEX IF NOT EXISTS idx_review_forms_user_id ON public.review_forms(user_id);
CREATE INDEX IF NOT EXISTS idx_review_forms_company_id ON public.review_forms(company_id);
CREATE INDEX IF NOT EXISTS idx_review_forms_slug ON public.review_forms(slug);

-- Set up Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_forms ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own data"
ON public.users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
ON public.users FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can view their company's data"
ON public.companies FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create companies"
ON public.companies FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their forms"
ON public.review_forms FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create forms"
ON public.review_forms FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their forms"
ON public.review_forms FOR UPDATE
USING (auth.uid() = user_id); 