-- ============================================
-- RESET PASSWORD TO "admin123" WITH BCRYPT
-- ============================================
-- Run this in your Supabase SQL Editor
-- Replace 'your-email@example.com' with your actual email

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- Reset password to "admin123"
-- ============================================
-- Replace 'your-email@example.com' with your actual email address

UPDATE public.ontimely_staff
SET 
    password_hash = crypt('admin123', gen_salt('bf', 10)),
    updated_at = timezone('utc'::text, now())
WHERE email = 'your-email@example.com';

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
WHERE email = 'your-email@example.com';

