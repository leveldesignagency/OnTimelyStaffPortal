-- Discount Codes System for Smart Advertising
-- Allows staff to create and manage discount codes for campaigns

CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  
  -- Discount Type: 'percentage' or 'fixed'
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  
  -- Discount Value
  -- For percentage: 0-100 (e.g., 20 = 20% off)
  -- For fixed: dollar amount (e.g., 50 = $50 off)
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
  
  -- Maximum discount amount (for percentage discounts)
  max_discount_amount DECIMAL(10, 2),
  
  -- Minimum purchase amount required
  min_purchase_amount DECIMAL(10, 2) DEFAULT 0,
  
  -- Usage limits
  max_uses INTEGER, -- NULL = unlimited
  current_uses INTEGER DEFAULT 0,
  
  -- Validity period
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  valid_until TIMESTAMP WITH TIME ZONE,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Campaign restrictions (optional)
  applicable_to_campaigns UUID[], -- Array of campaign IDs this code applies to (NULL = all campaigns)
  
  -- Metadata
  created_by UUID, -- Staff member who created the code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_active ON discount_codes(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_discount_codes_validity ON discount_codes(valid_from, valid_until);

-- Create function to validate and apply discount
CREATE OR REPLACE FUNCTION validate_discount_code(
  p_code VARCHAR(50),
  p_amount DECIMAL(10, 2)
)
RETURNS TABLE (
  valid BOOLEAN,
  discount_amount DECIMAL(10, 2),
  discount_type VARCHAR(20),
  discount_value DECIMAL(10, 2),
  message TEXT
) AS $$
DECLARE
  v_discount discount_codes%ROWTYPE;
  v_calculated_discount DECIMAL(10, 2);
BEGIN
  -- Find the discount code
  SELECT * INTO v_discount
  FROM discount_codes
  WHERE code = UPPER(TRIM(p_code))
    AND is_active = true
    AND (valid_from IS NULL OR valid_from <= NOW())
    AND (valid_until IS NULL OR valid_until >= NOW());
  
  -- Check if code exists
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0::DECIMAL(10, 2), ''::VARCHAR(20), 0::DECIMAL(10, 2), 'Discount code not found or invalid'::TEXT;
    RETURN;
  END IF;
  
  -- Check minimum purchase amount
  IF v_discount.min_purchase_amount > 0 AND p_amount < v_discount.min_purchase_amount THEN
    RETURN QUERY SELECT false, 0::DECIMAL(10, 2), v_discount.discount_type, v_discount.discount_value, 
      format('Minimum purchase amount of $%s required', v_discount.min_purchase_amount)::TEXT;
    RETURN;
  END IF;
  
  -- Check usage limits
  IF v_discount.max_uses IS NOT NULL AND v_discount.current_uses >= v_discount.max_uses THEN
    RETURN QUERY SELECT false, 0::DECIMAL(10, 2), v_discount.discount_type, v_discount.discount_value, 
      'Discount code has reached maximum usage limit'::TEXT;
    RETURN;
  END IF;
  
  -- Calculate discount amount
  IF v_discount.discount_type = 'percentage' THEN
    v_calculated_discount := (p_amount * v_discount.discount_value / 100);
    -- Apply maximum discount limit if set
    IF v_discount.max_discount_amount IS NOT NULL AND v_calculated_discount > v_discount.max_discount_amount THEN
      v_calculated_discount := v_discount.max_discount_amount;
    END IF;
  ELSE -- fixed
    v_calculated_discount := LEAST(v_discount.discount_value, p_amount); -- Can't discount more than the total
  END IF;
  
  -- Return valid discount
  RETURN QUERY SELECT true, v_calculated_discount, v_discount.discount_type, v_discount.discount_value, 
    format('Discount applied: $%s', v_calculated_discount)::TEXT;
END;
$$ LANGUAGE plpgsql;

-- Create function to increment discount code usage
CREATE OR REPLACE FUNCTION increment_discount_usage(p_code VARCHAR(50))
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE discount_codes
  SET current_uses = current_uses + 1,
      updated_at = NOW()
  WHERE code = UPPER(TRIM(p_code))
    AND is_active = true
    AND (max_uses IS NULL OR current_uses < max_uses);
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (if needed)
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- Policy: Staff can view all discount codes
CREATE POLICY "Staff can view discount codes" ON discount_codes
  FOR SELECT
  USING (true); -- Adjust based on your auth system

-- Policy: Only staff can create/update discount codes
CREATE POLICY "Staff can manage discount codes" ON discount_codes
  FOR ALL
  USING (true); -- Adjust based on your auth system

