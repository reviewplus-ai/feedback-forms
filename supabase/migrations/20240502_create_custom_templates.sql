-- Create custom_templates table
CREATE TABLE IF NOT EXISTS custom_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50) DEFAULT 'UTILITY',
  survey_type VARCHAR(20) DEFAULT 'CUSTOM',
  language VARCHAR(10) DEFAULT 'en',
  body TEXT NOT NULL,
  header TEXT,
  footer TEXT,
  buttons JSONB,
  variables JSONB,
  automation_trigger VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE custom_templates ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users to read templates
CREATE POLICY "Allow authenticated users to read custom_templates" ON custom_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only allow authenticated users to insert templates
CREATE POLICY "Allow authenticated users to insert custom_templates" ON custom_templates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Only allow authenticated users to update templates
CREATE POLICY "Allow authenticated users to update custom_templates" ON custom_templates
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Only allow authenticated users to delete templates
CREATE POLICY "Allow authenticated users to delete custom_templates" ON custom_templates
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create index for faster lookups
CREATE INDEX idx_custom_templates_name ON custom_templates(name);
CREATE INDEX idx_custom_templates_category ON custom_templates(category); 