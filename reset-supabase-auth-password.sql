-- ============================================
-- RESET PASSWORD IN SUPABASE AUTH
-- ============================================
-- This script resets the password for tommymorgan1991@gmail.com in Supabase Auth
-- Replace 'YourNewPassword123!' with your desired password
-- 
-- IMPORTANT: The mobile app uses Supabase Auth, not the users table password_hash

-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- First, find the user in auth.users
SELECT 
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at
FROM auth.users 
WHERE email = 'tommymorgan1991@gmail.com';

-- Reset password in Supabase Auth
-- Replace 'YourNewPassword123!' with your desired password
UPDATE auth.users
SET 
    encrypted_password = crypt('YourNewPassword123!', gen_salt('bf', 10)),
    updated_at = NOW()
WHERE email = 'tommymorgan1991@gmail.com';

-- Also update the users table password_hash for consistency (optional)
UPDATE users
SET 
    password_hash = crypt('YourNewPassword123!', gen_salt('bf', 10)),
    updated_at = timezone('utc'::text, now())
WHERE email = 'tommymorgan1991@gmail.com'
   OR id = 'aa87d213-78d0-4fd3-873f-5f05bf5b1f58';

-- Verify the password was reset in auth.users
SELECT 
    id,
    email,
    CASE 
        WHEN encrypted_password LIKE '$2a$%' OR encrypted_password LIKE '$2b$%' OR encrypted_password LIKE '$2y$%' THEN '✅ Valid bcrypt hash (password is set)'
        WHEN encrypted_password IS NULL THEN '❌ No password set'
        ELSE '❌ Invalid hash'
    END as password_status,
    email_confirmed_at,
    updated_at
FROM auth.users 
WHERE email = 'tommymorgan1991@gmail.com';

-- Verify the password was reset in users table
SELECT 
    id,
    email,
    name,
    role,
    CASE 
        WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' OR password_hash LIKE '$2y$%' THEN '✅ Valid bcrypt hash (password is set)'
        WHEN password_hash IS NULL THEN '❌ No password set'
        ELSE '❌ Invalid hash'
    END as password_status,
    updated_at
FROM users 
WHERE email = 'tommymorgan1991@gmail.com'
   OR id = 'aa87d213-78d0-4fd3-873f-5f05bf5b1f58';

