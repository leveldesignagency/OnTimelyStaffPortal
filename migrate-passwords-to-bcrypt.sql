-- ============================================
-- MIGRATE PLAIN TEXT PASSWORDS TO BCRYPT
-- ============================================
-- This script migrates existing plain text passwords to bcrypt hashes
-- IMPORTANT: Run this script AFTER updating your application code to use bcrypt

-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- STEP 1: Create function to hash passwords using bcrypt
-- ============================================
CREATE OR REPLACE FUNCTION hash_password_plain_text(plain_password TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Use PostgreSQL's crypt function with bcrypt
  -- This will generate a bcrypt hash with salt rounds 10
  RETURN crypt(plain_password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 2: Create function to verify passwords
-- ============================================
CREATE OR REPLACE FUNCTION verify_password(plain_password TEXT, password_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Use PostgreSQL's crypt function to verify
  RETURN crypt(plain_password, password_hash) = password_hash;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 3: Update existing plain text passwords
-- ============================================
-- WARNING: This assumes you know the current plain text passwords
-- If you don't know them, you'll need to reset passwords manually

-- Example: Update a specific user's password
-- Replace 'user@example.com' with actual email
-- Replace 'currentPassword' with the actual plain text password
-- Replace 'newPassword' with the new password you want to set

-- Update password for a specific user (if you know the current password)
-- UPDATE public.ontimely_staff
-- SET password_hash = hash_password_plain_text('newPassword')
-- WHERE email = 'user@example.com';

-- ============================================
-- STEP 4: Manual migration instructions
-- ============================================
-- Since we can't reverse plain text passwords, you have two options:

-- OPTION A: Reset all passwords (recommended for production)
-- 1. Generate new secure passwords for each staff member
-- 2. Hash them using the application code or this SQL function
-- 3. Update the database with the hashed passwords
-- 4. Send new passwords to staff members securely

-- OPTION B: If you know the current passwords
-- 1. For each staff member, hash their current password
-- 2. Update the password_hash column with the bcrypt hash

-- Example for OPTION B:
-- UPDATE public.ontimely_staff
-- SET password_hash = hash_password_plain_text('knownPassword')
-- WHERE email = 'staff@example.com';

-- ============================================
-- STEP 5: Verify the migration
-- ============================================
-- Check that all passwords are now bcrypt hashes (start with $2a$, $2b$, or $2y$)
SELECT 
    email,
    name,
    role,
    CASE 
        WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' OR password_hash LIKE '$2y$%' THEN '✅ Valid bcrypt hash'
        ELSE '❌ Invalid hash - needs migration: ' || LEFT(password_hash, 20) || '...'
    END as password_status,
    LENGTH(password_hash) as hash_length
FROM public.ontimely_staff
ORDER BY email;

-- ============================================
-- STEP 6: Test password verification
-- ============================================
-- Test that password verification works
-- Replace 'test@example.com' and 'testPassword' with actual values
-- SELECT 
--     email,
--     verify_password('testPassword', password_hash) as password_valid
-- FROM public.ontimely_staff
-- WHERE email = 'test@example.com';

-- ============================================
-- NOTES:
-- ============================================
-- 1. Bcrypt hashes always start with $2a$, $2b$, or $2y$
-- 2. Bcrypt hashes are 60 characters long
-- 3. Never store plain text passwords in the database
-- 4. Always use the verify_password function to check passwords
-- 5. When creating new staff accounts, hash passwords before inserting

-- ============================================
-- CLEANUP (optional - remove helper function after migration)
-- ============================================
-- After migration is complete, you can remove the helper function:
-- DROP FUNCTION IF EXISTS hash_password_plain_text(TEXT);

-- MIGRATE PLAIN TEXT PASSWORDS TO BCRYPT
-- ============================================
-- This script migrates existing plain text passwords to bcrypt hashes
-- IMPORTANT: Run this script AFTER updating your application code to use bcrypt

-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- STEP 1: Create function to hash passwords using bcrypt
-- ============================================
CREATE OR REPLACE FUNCTION hash_password_plain_text(plain_password TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Use PostgreSQL's crypt function with bcrypt
  -- This will generate a bcrypt hash with salt rounds 10
  RETURN crypt(plain_password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 2: Create function to verify passwords
-- ============================================
CREATE OR REPLACE FUNCTION verify_password(plain_password TEXT, password_hash TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Use PostgreSQL's crypt function to verify
  RETURN crypt(plain_password, password_hash) = password_hash;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 3: Update existing plain text passwords
-- ============================================
-- WARNING: This assumes you know the current plain text passwords
-- If you don't know them, you'll need to reset passwords manually

-- Example: Update a specific user's password
-- Replace 'user@example.com' with actual email
-- Replace 'currentPassword' with the actual plain text password
-- Replace 'newPassword' with the new password you want to set

-- Update password for a specific user (if you know the current password)
-- UPDATE public.ontimely_staff
-- SET password_hash = hash_password_plain_text('newPassword')
-- WHERE email = 'user@example.com';

-- ============================================
-- STEP 4: Manual migration instructions
-- ============================================
-- Since we can't reverse plain text passwords, you have two options:

-- OPTION A: Reset all passwords (recommended for production)
-- 1. Generate new secure passwords for each staff member
-- 2. Hash them using the application code or this SQL function
-- 3. Update the database with the hashed passwords
-- 4. Send new passwords to staff members securely

-- OPTION B: If you know the current passwords
-- 1. For each staff member, hash their current password
-- 2. Update the password_hash column with the bcrypt hash

-- Example for OPTION B:
-- UPDATE public.ontimely_staff
-- SET password_hash = hash_password_plain_text('knownPassword')
-- WHERE email = 'staff@example.com';

-- ============================================
-- STEP 5: Verify the migration
-- ============================================
-- Check that all passwords are now bcrypt hashes (start with $2a$, $2b$, or $2y$)
SELECT 
    email,
    name,
    role,
    CASE 
        WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' OR password_hash LIKE '$2y$%' THEN '✅ Valid bcrypt hash'
        ELSE '❌ Invalid hash - needs migration: ' || LEFT(password_hash, 20) || '...'
    END as password_status,
    LENGTH(password_hash) as hash_length
FROM public.ontimely_staff
ORDER BY email;

-- ============================================
-- STEP 6: Test password verification
-- ============================================
-- Test that password verification works
-- Replace 'test@example.com' and 'testPassword' with actual values
-- SELECT 
--     email,
--     verify_password('testPassword', password_hash) as password_valid
-- FROM public.ontimely_staff
-- WHERE email = 'test@example.com';

-- ============================================
-- NOTES:
-- ============================================
-- 1. Bcrypt hashes always start with $2a$, $2b$, or $2y$
-- 2. Bcrypt hashes are 60 characters long
-- 3. Never store plain text passwords in the database
-- 4. Always use the verify_password function to check passwords
-- 5. When creating new staff accounts, hash passwords before inserting

-- ============================================
-- CLEANUP (optional - remove helper function after migration)
-- ============================================
-- After migration is complete, you can remove the helper function:
-- DROP FUNCTION IF EXISTS hash_password_plain_text(TEXT);

