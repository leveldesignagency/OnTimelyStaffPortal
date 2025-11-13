-- ============================================
-- MIGRATE SUPER ADMIN PASSWORD TO BCRYPT
-- ============================================
-- This script migrates the Super Admin password to bcrypt
-- Email: leveldesignagency@gmail.com

-- Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- OPTION 1: If you know the current password
-- ============================================
-- Replace 'YourCurrentPassword' with the actual current password
-- Uncomment and run:

-- UPDATE public.ontimely_staff
-- SET 
--     password_hash = crypt('YourCurrentPassword', gen_salt('bf', 10)),
--     updated_at = timezone('utc'::text, now())
-- WHERE email = 'leveldesignagency@gmail.com';

-- ============================================
-- OPTION 2: Reset to a new password
-- ============================================
-- Replace 'NewSecurePassword123!' with your desired new password
-- Uncomment and run:

UPDATE public.ontimely_staff
SET 
    password_hash = crypt('NewSecurePassword123!', gen_salt('bf', 10)),
    updated_at = timezone('utc'::text, now())
WHERE email = 'leveldesignagency@gmail.com';

-- ============================================
-- Verify the migration
-- ============================================
SELECT 
    email,
    name,
    role,
    CASE 
        WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' OR password_hash LIKE '$2y$%' THEN '✅ Valid bcrypt hash'
        ELSE '❌ Invalid hash - needs migration'
    END as password_status,
    LENGTH(password_hash) as hash_length,
    updated_at
FROM public.ontimely_staff
WHERE email = 'leveldesignagency@gmail.com';

-- ============================================
-- Test password verification
-- ============================================
-- Replace 'NewSecurePassword123!' with the password you set above
-- Uncomment to test:

-- SELECT 
--     email,
--     crypt('NewSecurePassword123!', password_hash) = password_hash as password_valid
-- FROM public.ontimely_staff
-- WHERE email = 'leveldesignagency@gmail.com';

