-- Check and fix custom_templates table schema

-- First, let's see what columns currently exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'custom_templates';

-- Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add whatsapp_template_id if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'custom_templates' AND column_name = 'whatsapp_template_id'
    ) THEN
        ALTER TABLE custom_templates ADD COLUMN whatsapp_template_id TEXT;
    END IF;

    -- Add whatsapp_template_name if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'custom_templates' AND column_name = 'whatsapp_template_name'
    ) THEN
        ALTER TABLE custom_templates ADD COLUMN whatsapp_template_name TEXT;
    END IF;

    -- Add status if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'custom_templates' AND column_name = 'status'
    ) THEN
        ALTER TABLE custom_templates ADD COLUMN status TEXT DEFAULT 'PENDING';
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_custom_templates_whatsapp_id ON custom_templates(whatsapp_template_id);
CREATE INDEX IF NOT EXISTS idx_custom_templates_status ON custom_templates(status);

-- Show final schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'custom_templates'
ORDER BY ordinal_position; 