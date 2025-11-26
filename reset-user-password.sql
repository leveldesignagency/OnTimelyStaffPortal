-- ============================================
-- RESET PASSWORD FOR USER
-- ============================================
-- This script resets the password for tommymorgan1991@gmail.com
-- Replace 'YourNewPassword123!' with your desired password

-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Reset password for the user
UPDATE users
SET 
    password_hash = crypt('YourNewPassword123!', gen_salt('bf', 10)),
    updated_at = timezone('utc'::text, now())
WHERE email = 'tommymorgan1991@gmail.com'
   OR id = 'aa87d213-78d0-4fd3-873f-5f05bf5b1f58';

-- Verify the password was reset
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

