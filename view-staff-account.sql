-- ============================================
-- VIEW STAFF ACCOUNT DETAILS
-- ============================================
-- This query shows the staff account details for leveldesignagency@gmail.com
-- Note: Passwords are hashed with bcrypt, so the actual password cannot be retrieved

SELECT 
    id,
    email,
    name,
    role,
    is_active,
    CASE 
        WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' OR password_hash LIKE '$2y$%' THEN '✅ Valid bcrypt hash (password is set)'
        ELSE '❌ Invalid hash (password needs to be reset)'
    END as password_status,
    last_login,
    created_at,
    updated_at
FROM public.ontimely_staff 
WHERE email = 'leveldesignagency@gmail.com';

-- ============================================
-- RESET PASSWORD (if needed)
-- ============================================
-- If you need to reset the password, uncomment and run this:
-- Replace 'YourNewPassword123!' with your desired password

-- Enable the pgcrypto extension if not already enabled
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- UPDATE public.ontimely_staff
-- SET 
--     password_hash = crypt('YourNewPassword123!', gen_salt('bf', 10)),
--     updated_at = timezone('utc'::text, now())
-- WHERE email = 'leveldesignagency@gmail.com';

-- ============================================
-- VERIFY PASSWORD WAS RESET (after resetting)
-- ============================================
-- SELECT 
--     email,
--     name,
--     role,
--     CASE 
--         WHEN password_hash LIKE '$2a$%' OR password_hash LIKE '$2b$%' OR password_hash LIKE '$2y$%' THEN '✅ Valid bcrypt hash'
--         ELSE '❌ Invalid hash'
--     END as password_status,
--     updated_at
-- FROM public.ontimely_staff
-- WHERE email = 'leveldesignagency@gmail.com';

