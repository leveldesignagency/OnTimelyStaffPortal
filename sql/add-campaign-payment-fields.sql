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

-- Add discount code fields
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS discount_code VARCHAR(50);

ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;

ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS original_amount DECIMAL(10, 2);

-- Add discount_link field (used in campaign form)
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS discount_link TEXT;

-- Add index for payment status queries
CREATE INDEX IF NOT EXISTS idx_campaigns_payment_status ON campaigns(payment_status);

-- Add index for invoice_id lookups
CREATE INDEX IF NOT EXISTS idx_campaigns_invoice_id ON campaigns(invoice_id);

-- Add index for discount_code lookups
CREATE INDEX IF NOT EXISTS idx_campaigns_discount_code ON campaigns(discount_code);

-- Update existing campaigns to have default payment_status
UPDATE campaigns 
SET payment_status = 'pending' 
WHERE payment_status IS NULL;

-- Update existing campaigns to set original_amount if null
UPDATE campaigns 
SET original_amount = monthly_payment_amount 
WHERE original_amount IS NULL;

