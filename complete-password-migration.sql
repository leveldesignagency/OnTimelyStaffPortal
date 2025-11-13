-- ============================================
-- COMPLETE PASSWORD MIGRATION TO BCRYPT
-- ============================================
-- This script migrates all plain text passwords to bcrypt hashes
-- Run this script in your Supabase SQL Editor

-- ============================================
-- STEP 1: Enable pgcrypto extension
-- ============================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- STEP 2: Create helper functions
-- ============================================

-- Function to hash a plain text password using bcrypt
CREATE OR REPLACE FUNCTION hash_password_plain_text(plain_password TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Use PostgreSQL's crypt function with bcrypt
  -- This will generate a bcrypt hash with salt rounds 10
  RETURN crypt(plain_password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql;

-- Function to verify a password against a bcrypt hash
CREATE OR REPLACE FUNCTION verify_password(plain_password TEXT, password_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Use PostgreSQL's crypt function to verify
  RETURN crypt(plain_password, password_hash) = password_hash;
END;
$$ LANGUAGE plpgsql;

-- Function to verify staff password (for testing)
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

-- ============================================
-- STEP 3: Check current password status
-- ============================================
-- This shows which passwords need migration
SELECT 
    email,
    name,
    role,
    CASE 
        WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' OR password_hash LIKE '$2y$%' THEN '✅ Valid bcrypt hash'
        ELSE '❌ Needs migration: ' || LEFT(password_hash, 20) || '...'
    END as password_status,
    LENGTH(password_hash) as hash_length
FROM public.ontimely_staff
ORDER BY email;

-- ============================================
-- STEP 4: Migrate existing passwords
-- ============================================
-- IMPORTANT: You need to know the current passwords to migrate them
-- If you don't know the passwords, you'll need to reset them (see STEP 5)

-- Example: Migrate a specific user's password
-- Replace 'staff@example.com' with actual email
-- Replace 'currentPassword' with the actual plain text password
-- 
-- UPDATE public.ontimely_staff
-- SET password_hash = hash_password_plain_text('currentPassword')
-- WHERE email = 'staff@example.com';

-- ============================================
-- STEP 5: Reset passwords (if you don't know current passwords)
-- ============================================
-- If you don't know the current passwords, reset them to new secure passwords
-- Replace 'staff@example.com' with actual email
-- Replace 'NewSecurePassword123!' with the new password you want to set
--
-- UPDATE public.ontimely_staff
-- SET 
--     password_hash = crypt('NewSecurePassword123!', gen_salt('bf', 10)),
--     updated_at = timezone('utc'::text, now())
-- WHERE email = 'staff@example.com';

-- ============================================
-- STEP 6: Verify migration
-- ============================================
-- After migration, verify all passwords are bcrypt hashes
SELECT 
    email,
    name,
    role,
    CASE 
        WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' OR password_hash LIKE '$2y$%' THEN '✅ Valid bcrypt hash'
        ELSE '❌ Invalid hash - needs migration'
    END as password_status,
    updated_at
FROM public.ontimely_staff
ORDER BY email;

-- ============================================
-- STEP 7: Test password verification
-- ============================================
-- Test that password verification works
-- Replace 'staff@example.com' and 'testPassword' with actual values
--
-- SELECT 
--     email,
--     verify_staff_password('staff@example.com', 'testPassword') as password_valid
-- FROM public.ontimely_staff
-- WHERE email = 'staff@example.com';

-- ============================================
-- NOTES:
-- ============================================
-- 1. Bcrypt hashes always start with $2a$, $2b$, or $2y$
-- 2. Bcrypt hashes are 60 characters long
-- 3. Never store plain text passwords in the database
-- 4. Always use the verify_password function to check passwords
-- 5. When creating new staff accounts, hash passwords before inserting
--
-- Example for creating new staff:
-- INSERT INTO public.ontimely_staff (email, password_hash, name, role) 
-- VALUES (
--     'newstaff@example.com',
--     crypt('SecurePassword123!', gen_salt('bf', 10)),
--     'Staff Name',
--     'staff'
-- );

-- ============================================
-- CLEANUP (optional - after migration is complete)
-- ============================================
-- After migration is complete and verified, you can remove the helper function:
-- DROP FUNCTION IF EXISTS hash_password_plain_text(TEXT);

