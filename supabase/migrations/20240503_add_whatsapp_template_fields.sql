-- Add WhatsApp template fields to custom_templates table
ALTER TABLE custom_templates 
ADD COLUMN IF NOT EXISTS whatsapp_template_id TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_template_name TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'PENDING';
 
-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_custom_templates_whatsapp_id ON custom_templates(whatsapp_template_id);
CREATE INDEX IF NOT EXISTS idx_custom_templates_status ON custom_templates(status); 