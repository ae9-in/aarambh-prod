-- ══════════════════════════════════════════════════════════════
-- ARAMBH AUTH SETUP
-- Run this ENTIRE script in Supabase SQL Editor (Dashboard → SQL Editor)
-- ══════════════════════════════════════════════════════════════

-- 1. Add phone column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;

-- 2. Update the handle_new_user() trigger
--    Employees → status 'pending' (requires admin approval)
--    Admins/Managers → status 'active' (immediate access)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _role TEXT;
  _status TEXT;
BEGIN
  _role := COALESCE(NEW.raw_user_meta_data->>'role', 'EMPLOYEE');

  IF _role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER') THEN
    _status := 'active';
  ELSE
    _status := 'pending';
  END IF;

  INSERT INTO profiles (id, email, name, role, status, org_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    _role,
    _status,
    CASE
      WHEN NEW.raw_user_meta_data->>'org_id' IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'org_id')::UUID
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure the trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. RLS: Allow admins to update any profile (for approval flow)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'profiles'
    AND policyname = 'Admins update all profiles'
  ) THEN
    CREATE POLICY "Admins update all profiles"
      ON profiles FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
          AND p.role IN ('ADMIN', 'SUPER_ADMIN', 'MANAGER')
        )
      );
  END IF;
END $$;

-- 5. RLS: Allow admins to insert profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'profiles'
    AND policyname = 'Admins insert profiles'
  ) THEN
    CREATE POLICY "Admins insert profiles"
      ON profiles FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM profiles p
          WHERE p.id = auth.uid()
          AND p.role IN ('ADMIN', 'SUPER_ADMIN', 'MANAGER')
        )
      );
  END IF;
END $$;

-- 6. Ensure enquiries table exists
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  team_size TEXT,
  message TEXT,
  status TEXT DEFAULT 'new'
    CHECK (status IN ('new','contacted','closed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ══════════════════════════════════════════════════════════════
-- DONE! After running this SQL:
--
-- 1. Visit:  http://localhost:3000/api/setup/seed
--    (POST request — use browser console or Postman)
--    This creates the fixed admin/manager/HR accounts.
--
-- 2. Fixed credentials:
--    ┌──────────────────────┬──────────────┬─────────────┐
--    │ Email                │ Password     │ Role        │
--    ├──────────────────────┼──────────────┼─────────────┤
--    │ admin@arambh.com     │ Admin@123    │ SUPER_ADMIN │
--    │ manager@arambh.com   │ Manager@123  │ MANAGER     │
--    │ hr@arambh.com        │ HrAdmin@123  │ ADMIN (HR)  │
--    └──────────────────────┴──────────────┴─────────────┘
-- ══════════════════════════════════════════════════════════════
