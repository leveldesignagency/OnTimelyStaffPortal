-- Add payment status and invoice fields to campaigns table
-- This migration adds support for invoice-based payment flow

-- Add payment_status column
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending' 
CHECK (payment_status IN ('pending', 'invoice_sent', 'paid', 'failed'));

-- Add invoice tracking fields
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id);

ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS invoice_url TEXT;

-- Add index for payment status queries
CREATE INDEX IF NOT EXISTS idx_campaigns_payment_status ON campaigns(payment_status);

-- Add index for invoice_id lookups
CREATE INDEX IF NOT EXISTS idx_campaigns_invoice_id ON campaigns(invoice_id);

-- Update existing campaigns to have default payment_status
UPDATE campaigns 
SET payment_status = 'pending' 
WHERE payment_status IS NULL;

-- Add 'pending' to status enum if not already present
-- Note: This assumes status is a VARCHAR, not an enum. If it's an enum, you'll need to alter the enum type.
-- For now, we'll just ensure the constraint allows 'pending'
-- The existing CHECK constraint should already allow 'pending' if status is VARCHAR

