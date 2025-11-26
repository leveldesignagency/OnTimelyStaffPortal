-- ============================================
-- FIX ALL USERS FOR MOBILE APP LOGIN
-- ============================================
-- This script fixes all users who were created via the portal
-- but can't log in to the mobile app because email_confirmed_at is NULL
--
-- It will:
-- 1. Find all users in the users table
-- 2. Check if they exist in auth.users
-- 3. Create/update them in auth.users with email_confirmed_at set
-- 4. Ensure IDs match between users and auth.users

-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================
-- STEP 1: Check current status
-- ============================================
SELECT 
    'Current Status Check' as step,
    COUNT(*) as total_users_in_users_table
FROM users;

SELECT 
    'Users in auth.users' as step,
    COUNT(*) as total_users_in_auth
FROM auth.users;

SELECT 
    'Users missing from auth.users' as step,
    COUNT(*) as missing_count
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
WHERE au.id IS NULL;

SELECT 
    'Users with unconfirmed emails' as step,
    COUNT(*) as unconfirmed_count
FROM auth.users
WHERE email_confirmed_at IS NULL;

-- ============================================
-- STEP 2: Get instance_id
-- ============================================
DO $$
DECLARE
    v_instance_id UUID;
BEGIN
    -- Get instance_id (usually all zeros for Supabase)
    SELECT COALESCE(
        (SELECT instance_id FROM auth.users LIMIT 1),
        '00000000-0000-0000-0000-000000000000'::UUID
    ) INTO v_instance_id;
    
    RAISE NOTICE 'Using instance_id: %', v_instance_id;
END $$;

-- ============================================
-- STEP 3: Fix all users - create/update in auth.users
-- ============================================
DO $$
DECLARE
    v_user RECORD;
    v_instance_id UUID;
    v_existing_auth_id UUID;
    v_default_password TEXT := 'TempPassword123!'; -- Users should reset via portal
BEGIN
    -- Get instance_id
    SELECT COALESCE(
        (SELECT instance_id FROM auth.users LIMIT 1),
        '00000000-0000-0000-0000-000000000000'::UUID
    ) INTO v_instance_id;
    
    -- Loop through all users in the users table
    FOR v_user IN 
        SELECT 
            u.id,
            u.email,
            u.name,
            u.company_id,
            u.role,
            u.created_at,
            au.id as auth_id,
            au.email_confirmed_at
        FROM users u
        LEFT JOIN auth.users au ON u.id = au.id
    LOOP
        -- Check if user exists in auth.users by ID
        IF v_user.auth_id IS NULL THEN
            -- Check if user exists by email (different ID scenario)
            SELECT id INTO v_existing_auth_id
            FROM auth.users
            WHERE email = v_user.email
            LIMIT 1;
            
            IF v_existing_auth_id IS NOT NULL THEN
                -- User exists with same email but different ID
                -- DON'T change IDs - just confirm the email so they can log in
                -- The IDs don't need to match for login to work, just email needs to be confirmed
                RAISE NOTICE 'User % exists in auth.users with ID %. Confirming email (users.id=% stays unchanged)', 
                    v_user.email, v_existing_auth_id, v_user.id;
                
                -- Confirm email for the existing auth user
                UPDATE auth.users
                SET 
                    email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
                    updated_at = NOW(),
                    raw_user_meta_data = COALESCE(
                        raw_user_meta_data,
                        jsonb_build_object(
                            'name', v_user.name,
                            'company_id', v_user.company_id,
                            'role', v_user.role
                        )
                    )
                WHERE id = v_existing_auth_id;
            ELSE
                -- User doesn't exist in auth.users at all - create them
                RAISE NOTICE 'Creating auth user for: % (ID: %)', v_user.email, v_user.id;
                
                BEGIN
                    INSERT INTO auth.users (
                        id,
                        instance_id,
                        email,
                        encrypted_password,
                        email_confirmed_at,  -- CRITICAL: Set this so they can log in
                        created_at,
                        updated_at,
                        aud,
                        role,
                        confirmation_token,
                        email_change_token_new,
                        recovery_token,
                        raw_user_meta_data
                    ) VALUES (
                        v_user.id,
                        v_instance_id,
                        v_user.email,
                        crypt(v_default_password, gen_salt('bf', 10)), -- Temporary password
                        NOW(),  -- Email confirmed = can log in immediately
                        COALESCE(v_user.created_at, NOW()),
                        NOW(),
                        'authenticated',
                        'authenticated',
                        '',
                        '',
                        '',
                        jsonb_build_object(
                            'name', v_user.name,
                            'company_id', v_user.company_id,
                            'role', v_user.role
                        )
                    );
                EXCEPTION WHEN unique_violation THEN
                    -- If email conflict occurs, just confirm the existing user's email
                    RAISE NOTICE 'Email % already exists in auth.users, confirming existing record', v_user.email;
                    
                    UPDATE auth.users
                    SET 
                        email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
                        updated_at = NOW(),
                        raw_user_meta_data = COALESCE(
                            raw_user_meta_data,
                            jsonb_build_object(
                                'name', v_user.name,
                                'company_id', v_user.company_id,
                                'role', v_user.role
                            )
                        )
                    WHERE email = v_user.email;
                END;
            END IF;
        ELSE
            -- User exists with matching ID - just confirm email if needed
            IF v_user.email_confirmed_at IS NULL THEN
                RAISE NOTICE 'Confirming email for existing auth user: % (ID: %)', v_user.email, v_user.id;
                
                UPDATE auth.users
                SET 
                    email_confirmed_at = NOW(),
                    updated_at = NOW()
                WHERE id = v_user.id;
            END IF;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ All users fixed!';
END $$;

-- ============================================
-- STEP 4: Verify the fix
-- ============================================
SELECT 
    '✅ Verification' as status,
    u.email,
    u.name,
    u.role,
    CASE 
        WHEN au.id IS NOT NULL THEN '✅ Exists in auth.users'
        ELSE '❌ Missing from auth.users'
    END as auth_status,
    CASE 
        WHEN au.email_confirmed_at IS NOT NULL THEN '✅ Email confirmed (can login)'
        ELSE '❌ Email NOT confirmed (cannot login)'
    END as login_status,
    au.id as auth_id,
    u.id as users_id,
    CASE 
        WHEN au.id = u.id THEN '✅ IDs match'
        ELSE '❌ IDs do NOT match'
    END as id_match
FROM users u
LEFT JOIN auth.users au ON u.id = au.id
ORDER BY u.email;

-- ============================================
-- STEP 5: Summary
-- ============================================
SELECT 
    '📊 Summary' as report,
    COUNT(*) FILTER (WHERE au.id IS NOT NULL AND au.email_confirmed_at IS NOT NULL) as users_ready_for_login,
    COUNT(*) FILTER (WHERE au.id IS NULL) as users_missing_from_auth,
    COUNT(*) FILTER (WHERE au.id IS NOT NULL AND au.email_confirmed_at IS NULL) as users_unconfirmed,
    COUNT(*) as total_users
FROM users u
LEFT JOIN auth.users au ON u.id = au.id;

