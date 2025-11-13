# Migration Plan: Custom Auth → Supabase Auth

## Overview
Migrate staff portal from custom authentication to Supabase Auth for better security, RLS support, and consistency.

## Benefits
✅ **RLS Support** - No more service role workarounds for storage/uploads  
✅ **Better Security** - JWT tokens, automatic refresh, secure session management  
✅ **Consistency** - Aligns with rest of OnTimely platform  
✅ **Built-in Features** - Password reset, email verification, OAuth ready  
✅ **Less Code** - Remove custom auth service, password utils  

## Migration Steps

### Step 1: Create Supabase Auth Users for Existing Staff

**SQL Migration:**
```sql
-- Create Supabase Auth users for existing staff
-- This will create auth.users entries linked to ontimely_staff table

DO $$
DECLARE
  staff_record RECORD;
  auth_user_id UUID;
BEGIN
  FOR staff_record IN SELECT * FROM ontimely_staff WHERE is_active = true LOOP
    -- Create auth user (you'll need to set password separately or send reset email)
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      (SELECT id FROM auth.instances LIMIT 1),
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      staff_record.email,
      crypt('temp_password_change_me', gen_salt('bf')), -- Temporary password
      now(),
      now(),
      now(),
      encode(gen_random_bytes(32), 'hex'),
      staff_record.email,
      encode(gen_random_bytes(32), 'hex'),
      encode(gen_random_bytes(32), 'hex')
    )
    RETURNING id INTO auth_user_id;
    
    -- Link auth user to staff record
    UPDATE ontimely_staff 
    SET auth_user_id = auth_user_id
    WHERE id = staff_record.id;
    
    RAISE NOTICE 'Created auth user for: %', staff_record.email;
  END LOOP;
END $$;
```

**Alternative: Use Supabase Admin API**
- Better approach: Use Supabase Admin API to create users
- Can set initial passwords or send password reset emails
- More secure than SQL approach

### Step 2: Add `auth_user_id` Column to `ontimely_staff` Table

```sql
-- Add auth_user_id column to link staff to auth.users
ALTER TABLE ontimely_staff 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_ontimely_staff_auth_user_id 
ON ontimely_staff(auth_user_id);

-- Update RLS policies to use auth.uid()
DROP POLICY IF EXISTS "Staff can view own profile" ON ontimely_staff;
CREATE POLICY "Staff can view own profile" ON ontimely_staff
  FOR SELECT USING (
    auth_user_id = auth.uid()
  );

-- Directors and admins can view all
DROP POLICY IF EXISTS "Directors and admins can view all staff" ON ontimely_staff;
CREATE POLICY "Directors and admins can view all staff" ON ontimely_staff
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ontimely_staff 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('director', 'admin')
    )
  );
```

### Step 3: Update `staffAuth.ts` to Use Supabase Auth

**New Implementation:**
```typescript
import { supabase } from './supabase'

export interface StaffMember {
  id: string
  email: string
  name: string
  role: 'director' | 'admin' | 'staff'
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
  auth_user_id?: string
}

export interface AuthState {
  user: StaffMember | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

class StaffAuthService {
  private authState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  }

  // Initialize - check Supabase Auth session
  async init(): Promise<AuthState> {
    try {
      // Get current Supabase session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Fetch staff member linked to this auth user
        await this.fetchCurrentUser(session.user.id)
      }
      
      this.authState.isLoading = false
      return this.authState
    } catch (error) {
      this.authState.isLoading = false
      this.authState.error = 'Failed to initialize authentication'
      return this.authState
    }
  }

  // Login using Supabase Auth
  async login(credentials: { email: string; password: string }): Promise<AuthState> {
    try {
      this.authState.isLoading = true
      this.authState.error = null

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Invalid credentials')
      }

      // Fetch staff member linked to auth user
      await this.fetchCurrentUser(authData.user.id)

      // Update last login
      if (this.authState.user) {
        await supabase
          .from('ontimely_staff')
          .update({ last_login: new Date().toISOString() })
          .eq('auth_user_id', authData.user.id)
      }

      this.authState.isLoading = false
      return this.authState
    } catch (error) {
      this.authState.error = error instanceof Error ? error.message : 'Login failed'
      this.authState.isLoading = false
      this.authState.isAuthenticated = false
      return this.authState
    }
  }

  // Logout
  async logout(): Promise<AuthState> {
    await supabase.auth.signOut()
    this.authState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    }
    return this.authState
  }

  // Fetch current user from database
  private async fetchCurrentUser(authUserId: string): Promise<void> {
    try {
      const { data: staffMember, error } = await supabase
        .from('ontimely_staff')
        .select('*')
        .eq('auth_user_id', authUserId)
        .eq('is_active', true)
        .single()

      if (error || !staffMember) {
        this.authState.user = null
        this.authState.isAuthenticated = false
        return
      }

      this.authState.user = staffMember
      this.authState.isAuthenticated = true
    } catch (error) {
      this.authState.user = null
      this.authState.isAuthenticated = false
    }
  }

  // Get current user
  async getCurrentUser(): Promise<StaffMember | null> {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user && !this.authState.user) {
      await this.fetchCurrentUser(session.user.id)
    }
    return this.authState.user
  }

  // Role checks
  hasRole(role: 'director' | 'admin' | 'staff'): boolean {
    if (!this.authState.user) return false
    const roleHierarchy = { director: 3, admin: 2, staff: 1 }
    return roleHierarchy[this.authState.user.role] >= roleHierarchy[role]
  }

  isDirector(): boolean {
    return this.hasRole('director')
  }

  isAdmin(): boolean {
    return this.hasRole('admin')
  }

  isStaff(): boolean {
    return this.hasRole('staff')
  }

  // Get auth state
  getAuthState(): AuthState {
    return { ...this.authState }
  }

  isAuthenticated(): boolean {
    return this.authState.isAuthenticated
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (state: AuthState) => void) {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await this.fetchCurrentUser(session.user.id)
      } else {
        this.authState.user = null
        this.authState.isAuthenticated = false
      }
      callback(this.authState)
    })
  }
}

export const staffAuth = new StaffAuthService()

// Set up auth state listener
supabase.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    await staffAuth.fetchCurrentUser(session.user.id)
  } else {
    staffAuth.getAuthState().user = null
    staffAuth.getAuthState().isAuthenticated = false
  }
})
```

### Step 4: Update Storage RLS Policies

```sql
-- Update storage policies to use auth.uid()
DROP POLICY IF EXISTS "Allow authenticated users to upload app images" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload app images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'app-images' AND
  auth.uid() IN (SELECT auth_user_id FROM ontimely_staff WHERE is_active = true)
);

-- Similar updates for UPDATE and DELETE policies
```

### Step 5: Remove Custom Password Utils

- Delete `passwordUtils.ts` (no longer needed)
- Supabase Auth handles password hashing/verification

### Step 6: Update Components

**Minimal changes needed:**
- `Login.tsx` - Already uses `staffAuth.login()`, should work as-is
- `App.tsx` - Already uses `staffAuth.init()`, should work as-is
- `Sidebar.tsx` - Already uses `staffAuth.logout()`, should work as-is
- Other components - No changes needed, API is the same

### Step 7: Create New Staff Members

**When creating new staff:**
1. Create Supabase Auth user first
2. Then create `ontimely_staff` record with `auth_user_id`

**Example:**
```typescript
// Create auth user
const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
  email: staffMember.email,
  password: temporaryPassword,
  email_confirm: true
})

// Create staff record
const { data: staff, error: staffError } = await supabase
  .from('ontimely_staff')
  .insert({
    email: staffMember.email,
    name: staffMember.name,
    role: staffMember.role,
    auth_user_id: authUser.user.id
  })
```

## Migration Checklist

- [ ] Add `auth_user_id` column to `ontimely_staff` table
- [ ] Create Supabase Auth users for existing staff
- [ ] Update RLS policies to use `auth.uid()`
- [ ] Update `staffAuth.ts` to use Supabase Auth
- [ ] Update storage RLS policies
- [ ] Test login/logout flow
- [ ] Test protected routes
- [ ] Test role-based access
- [ ] Remove `passwordUtils.ts`
- [ ] Remove custom password hashing code
- [ ] Update staff creation flow to create auth users
- [ ] Test password reset (if needed)

## Rollback Plan

If issues arise:
1. Keep old `staffAuth.ts` as backup
2. Can revert to custom auth by switching imports
3. `auth_user_id` column is nullable, won't break existing data

## Estimated Effort

- **Time**: 2-4 hours
- **Complexity**: Medium
- **Risk**: Low (can rollback easily)
- **Value**: High (solves RLS issues, better security)

## Next Steps

1. Review this plan
2. Test in development environment first
3. Create Supabase Auth users for existing staff
4. Update code
5. Test thoroughly
6. Deploy

