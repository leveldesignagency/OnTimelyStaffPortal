-- ============================================
-- CHECK TOMMY MORGAN PASSWORD STATUS
-- ============================================
-- This checks if the password is set correctly

-- Check password hash exists and length
SELECT 
    'Password Status' as check_name,
    email,
    CASE 
        WHEN encrypted_password IS NOT NULL AND encrypted_password != '' THEN '✅ Password hash exists'
        ELSE '❌ No password hash - USER CANNOT LOGIN'
    END as password_status,
    LENGTH(encrypted_password) as password_hash_length,
    CASE 
        WHEN LENGTH(encrypted_password) > 50 THEN '✅ Hash looks valid'
        ELSE '⚠️ Hash might be invalid'
    END as hash_validity
FROM auth.users
WHERE email = 'tommymorgan1991@gmail.com';

-- Check when password was last updated
SELECT 
    'Password Update Info' as check_name,
    email,
    updated_at,
    created_at,
    CASE 
        WHEN updated_at > created_at THEN '✅ Password has been updated'
        ELSE '⚠️ Password might still be default/temporary'
    END as password_update_status
FROM auth.users
WHERE email = 'tommymorgan1991@gmail.com';

