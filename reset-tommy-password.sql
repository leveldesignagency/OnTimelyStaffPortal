-- ============================================
-- RESET TOMMY MORGAN PASSWORD
-- ============================================
-- Replace 'YourNewPassword123!' with the actual password you want
-- This will hash it using bcrypt (same as Supabase uses)

-- Enable pgcrypto if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Update the password
UPDATE auth.users
SET 
    encrypted_password = crypt('Octagon123', gen_salt('bf', 10)),
    updated_at = NOW()
WHERE email = 'tommymorgan1991@gmail.com';

-- Verify the update
SELECT 
    'Password Reset Complete' as status,
    email,
    updated_at,
    CASE 
        WHEN encrypted_password IS NOT NULL AND encrypted_password != '' THEN '✅ Password hash updated'
        ELSE '❌ Password hash not updated'
    END as result
FROM auth.users
WHERE email = 'tommymorgan1991@gmail.com';

