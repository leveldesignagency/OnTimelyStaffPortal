-- ============================================
-- CHECK TOMMY'S ROLE
-- ============================================
-- Mobile app checks user.role to determine if admin or guest

SELECT 
    'User Role Check' as check_type,
    id,
    email,
    name,
    role,
    CASE 
        WHEN role = 'guest' THEN '❌ Marked as GUEST - Mobile will try to find guest profile'
        WHEN role IS NULL THEN '❌ Role is NULL - Mobile may not recognize as admin'
        WHEN role = 'user' THEN '✅ Marked as USER - Should work as admin'
        WHEN role = 'admin' THEN '✅ Marked as ADMIN - Should work'
        ELSE '⚠️ Role is: ' || role || ' - May cause issues'
    END as role_status
FROM users
WHERE email = 'tommymorgan1991@gmail.com';

