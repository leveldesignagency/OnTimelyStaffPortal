-- ============================================
-- RESET STAFF PASSWORD WITH BCRYPT
-- ============================================
-- This script resets a staff member's password with a new bcrypt hash

-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- Reset password for a specific staff member
-- ============================================
-- Replace the following values:
-- - 'staff@example.com' with the actual email
-- - 'NewSecurePassword123!' with the new password

UPDATE public.ontimely_staff
SET 
    password_hash = crypt('NewSecurePassword123!', gen_salt('bf', 10)),
    updated_at = timezone('utc'::text, now())
WHERE email = 'staff@example.com';

-- ============================================
-- Verify the password was updated
-- ============================================
SELECT 
    email,
    name,
    role,
    CASE 
        WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' OR password_hash LIKE '$2y$%' THEN '✅ Valid bcrypt hash'
        ELSE '❌ Invalid hash'
    END as password_status,
    updated_at
FROM public.ontimely_staff
WHERE email = 'staff@example.com';

-- ============================================
-- Bulk reset passwords (use with caution)
-- ============================================
-- This will reset ALL staff passwords to the same value
-- Only use this in emergency situations or during initial setup
-- 
-- UPDATE public.ontimely_staff
-- SET 
--     password_hash = crypt('TemporaryPassword123!', gen_salt('bf', 10)),
--     updated_at = timezone('utc'::text, now())
-- WHERE is_active = true;

-- RESET STAFF PASSWORD WITH BCRYPT
-- ============================================
-- This script resets a staff member's password with a new bcrypt hash

-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- Reset password for a specific staff member
-- ============================================
-- Replace the following values:
-- - 'staff@example.com' with the actual email
-- - 'NewSecurePassword123!' with the new password

UPDATE public.ontimely_staff
SET 
    password_hash = crypt('NewSecurePassword123!', gen_salt('bf', 10)),
    updated_at = timezone('utc'::text, now())
WHERE email = 'staff@example.com';

-- ============================================
-- Verify the password was updated
-- ============================================
SELECT 
    email,
    name,
    role,
    CASE 
        WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' OR password_hash LIKE '$2y$%' THEN '✅ Valid bcrypt hash'
        ELSE '❌ Invalid hash'
    END as password_status,
    updated_at
FROM public.ontimely_staff
WHERE email = 'staff@example.com';

-- ============================================
-- Bulk reset passwords (use with caution)
-- ============================================
-- This will reset ALL staff passwords to the same value
-- Only use this in emergency situations or during initial setup
-- 
-- UPDATE public.ontimely_staff
-- SET 
--     password_hash = crypt('TemporaryPassword123!', gen_salt('bf', 10)),
--     updated_at = timezone('utc'::text, now())
-- WHERE is_active = true;

