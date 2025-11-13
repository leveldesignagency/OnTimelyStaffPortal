-- ============================================
-- CREATE STAFF ACCOUNT WITH BCRYPT PASSWORD
-- ============================================
-- This script shows how to create a new staff account with a bcrypt-hashed password

-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- Create staff account with bcrypt password
-- ============================================
-- Replace the following values:
-- - 'staff@example.com' with the actual email
-- - 'SecurePassword123!' with the actual password
-- - 'Staff Name' with the actual name
-- - 'staff' with the role ('director', 'admin', or 'staff')

INSERT INTO public.ontimely_staff (email, password_hash, name, role) 
VALUES (
    'staff@example.com',
    crypt('SecurePassword123!', gen_salt('bf', 10)), -- bcrypt hash with 10 salt rounds
    'Staff Name',
    'staff'
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = timezone('utc'::text, now());

-- ============================================
-- Verify the account was created with bcrypt hash
-- ============================================
SELECT 
    id,
    email,
    name,
    role,
    is_active,
    CASE 
        WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' OR password_hash LIKE '$2y$%' THEN '✅ Valid bcrypt hash'
        ELSE '❌ Invalid hash'
    END as password_status,
    created_at
FROM public.ontimely_staff 
WHERE email = 'staff@example.com';

-- ============================================
-- Test password verification
-- ============================================
-- This function verifies a password against the stored hash
CREATE OR REPLACE FUNCTION verify_staff_password(staff_email TEXT, plain_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    stored_hash TEXT;
BEGIN
    SELECT password_hash INTO stored_hash
    FROM public.ontimely_staff
    WHERE email = staff_email AND is_active = true;
    
    IF stored_hash IS NULL THEN
        RETURN false;
    END IF;
    
    RETURN crypt(plain_password, stored_hash) = stored_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the verification function
-- SELECT verify_staff_password('staff@example.com', 'SecurePassword123!') as password_valid;

-- CREATE STAFF ACCOUNT WITH BCRYPT PASSWORD
-- ============================================
-- This script shows how to create a new staff account with a bcrypt-hashed password

-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- Create staff account with bcrypt password
-- ============================================
-- Replace the following values:
-- - 'staff@example.com' with the actual email
-- - 'SecurePassword123!' with the actual password
-- - 'Staff Name' with the actual name
-- - 'staff' with the role ('director', 'admin', or 'staff')

INSERT INTO public.ontimely_staff (email, password_hash, name, role) 
VALUES (
    'staff@example.com',
    crypt('SecurePassword123!', gen_salt('bf', 10)), -- bcrypt hash with 10 salt rounds
    'Staff Name',
    'staff'
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = timezone('utc'::text, now());

-- ============================================
-- Verify the account was created with bcrypt hash
-- ============================================
SELECT 
    id,
    email,
    name,
    role,
    is_active,
    CASE 
        WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' OR password_hash LIKE '$2y$%' THEN '✅ Valid bcrypt hash'
        ELSE '❌ Invalid hash'
    END as password_status,
    created_at
FROM public.ontimely_staff 
WHERE email = 'staff@example.com';

-- ============================================
-- Test password verification
-- ============================================
-- This function verifies a password against the stored hash
CREATE OR REPLACE FUNCTION verify_staff_password(staff_email TEXT, plain_password TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    stored_hash TEXT;
BEGIN
    SELECT password_hash INTO stored_hash
    FROM public.ontimely_staff
    WHERE email = staff_email AND is_active = true;
    
    IF stored_hash IS NULL THEN
        RETURN false;
    END IF;
    
    RETURN crypt(plain_password, stored_hash) = stored_hash;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the verification function
-- SELECT verify_staff_password('staff@example.com', 'SecurePassword123!') as password_valid;

