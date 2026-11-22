-- ============================================================================
-- Agent SPM Web — Idempotent Production Security & Multi-Tenant RLS Migration
-- Target Project: pbcnraifbapghtcavwqs (Postgres 17.6)
-- Run in Supabase Dashboard SQL Editor -> Review & Execute
-- ============================================================================

-- 1. Unexposed Private Schema + Privileged SECURITY DEFINER Helpers
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.current_public_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT u.id
  FROM public.users u
  WHERE u.supabase_uid = (SELECT auth.uid())::text
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION private.current_github_provider_id()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT i.provider_id
  FROM auth.identities i
  WHERE i.user_id = (SELECT auth.uid())
    AND i.provider = 'github'
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION private.is_org_member(p_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE
    WHEN p_org_id IS NULL OR (SELECT auth.uid()) IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.organization_members om
      JOIN public.users u ON u.id = om.user_id
      WHERE om.org_id = p_org_id
        AND u.supabase_uid = (SELECT auth.uid())::text
    )
  END;
$$;

CREATE OR REPLACE FUNCTION private.is_org_admin(p_org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE
    WHEN p_org_id IS NULL OR (SELECT auth.uid()) IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.organization_members om
      JOIN public.users u ON u.id = om.user_id
      WHERE om.org_id = p_org_id
        AND u.supabase_uid = (SELECT auth.uid())::text
        AND om.role IN ('owner', 'admin')
    )
  END;
$$;

CREATE OR REPLACE FUNCTION private.is_superadmin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT CASE
    WHEN (SELECT auth.uid()) IS NULL THEN false
    ELSE EXISTS (
      SELECT 1
      FROM public.users u
      WHERE u.supabase_uid = (SELECT auth.uid())::text
        AND u.role = 'superadmin'
    )
  END;
$$;

CREATE OR REPLACE FUNCTION private.owns_package_owner_id(p_owner_id text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT p_owner_id IS NOT NULL
    AND (SELECT auth.uid()) IS NOT NULL
    AND (
      p_owner_id = (SELECT auth.uid())::text
      OR p_owner_id = (SELECT private.current_public_user_id())::text
      OR p_owner_id = (SELECT private.current_github_provider_id())
    );
$$;

REVOKE ALL ON FUNCTION private.current_public_user_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.current_github_provider_id() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_org_member(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_org_admin(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_superadmin() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.owns_package_owner_id(text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION private.current_public_user_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.current_github_provider_id() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_org_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_org_admin(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_superadmin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.owns_package_owner_id(text) TO authenticated, service_role;

-- 2. Harden public.handle_new_user() (Fixed search_path, schema-qualified, revoked from PUBLIC/anon/authenticated)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_email text;
  v_display_name text;
BEGIN
  v_email := lower(trim(COALESCE(NEW.email, '')));
  v_display_name := NULLIF(trim(COALESCE(
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name',
    NEW.raw_user_meta_data ->> 'user_name',
    split_part(v_email, '@', 1)
  )), '');

  INSERT INTO public.users (supabase_uid, email, display_name, role)
  VALUES (
    NEW.id::text,
    v_email,
    v_display_name,
    'user'
  )
  ON CONFLICT (supabase_uid) DO UPDATE
    SET email = COALESCE(NULLIF(EXCLUDED.email, ''), public.users.email),
        display_name = COALESCE(public.users.display_name, EXCLUDED.display_name),
        updated_at = now();

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 3. Performance Indexes & Integrity Constraints
CREATE INDEX IF NOT EXISTS idx_users_supabase_uid ON public.users (supabase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email_lower ON public.users (lower(email));

-- Support safe ON CONFLICT (org_id, user_id) upserts in auth/callback and otp/verify
CREATE UNIQUE INDEX IF NOT EXISTS idx_org_members_org_user_uidx
  ON public.organization_members (org_id, user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.organization_members (user_id);

CREATE INDEX IF NOT EXISTS idx_packages_owner_id ON public.packages (owner_id);
CREATE INDEX IF NOT EXISTS idx_packages_visibility ON public.packages (visibility);
CREATE INDEX IF NOT EXISTS idx_package_versions_pkg_name ON public.package_versions (package_name);
CREATE INDEX IF NOT EXISTS idx_package_versions_published_by ON public.package_versions (published_by);

CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys (user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_org_id ON public.api_keys (org_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_user_id ON public.entitlements (user_id);
CREATE INDEX IF NOT EXISTS idx_pending_invites_org_id ON public.pending_invites (org_id);
CREATE INDEX IF NOT EXISTS idx_pending_invites_email ON public.pending_invites (lower(email));
CREATE INDEX IF NOT EXISTS idx_audit_log_actor_created ON public.audit_log (actor_id, created_at DESC);

-- Ensure deleting a package cascades cleanly to package_versions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_schema = 'public'
      AND table_name = 'package_versions'
      AND constraint_name = 'package_versions_package_name_fkey'
  ) THEN
    ALTER TABLE public.package_versions
      DROP CONSTRAINT package_versions_package_name_fkey,
      ADD CONSTRAINT package_versions_package_name_fkey
        FOREIGN KEY (package_name) REFERENCES public.packages(name) ON DELETE CASCADE;
  END IF;
END $$;

-- 4. Enable RLS Across All 11 Public Tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_dummy ENABLE ROW LEVEL SECURITY;

-- 5. Least-Privilege Multi-Tenant Policies (Idempotent)

-- A. public.users
DROP POLICY IF EXISTS "users_select_self_org_or_superadmin" ON public.users;
CREATE POLICY "users_select_self_org_or_superadmin"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    supabase_uid = (SELECT auth.uid())::text
    OR (SELECT private.is_superadmin())
    OR EXISTS (
      SELECT 1
      FROM public.organization_members om_target
      WHERE om_target.user_id = public.users.id
        AND (SELECT private.is_org_member(om_target.org_id))
    )
  );

REVOKE INSERT, DELETE ON public.users FROM anon, authenticated;
REVOKE UPDATE ON public.users FROM authenticated;
GRANT UPDATE (display_name, updated_at) ON public.users TO authenticated;

DROP POLICY IF EXISTS "users_update_own_profile" ON public.users;
CREATE POLICY "users_update_own_profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (supabase_uid = (SELECT auth.uid())::text)
  WITH CHECK (supabase_uid = (SELECT auth.uid())::text);

-- B. public.organizations
DROP POLICY IF EXISTS "organizations_select_members_or_superadmin" ON public.organizations;
CREATE POLICY "organizations_select_members_or_superadmin"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (
    (SELECT private.is_org_member(id))
    OR (SELECT private.is_superadmin())
  );

DROP POLICY IF EXISTS "organizations_update_admin_or_superadmin" ON public.organizations;
CREATE POLICY "organizations_update_admin_or_superadmin"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (
    (SELECT private.is_org_admin(id))
    OR (SELECT private.is_superadmin())
  )
  WITH CHECK (
    (SELECT private.is_org_admin(id))
    OR (SELECT private.is_superadmin())
  );

-- C. public.organization_members
DROP POLICY IF EXISTS "org_members_select_same_org_or_superadmin" ON public.organization_members;
CREATE POLICY "org_members_select_same_org_or_superadmin"
  ON public.organization_members FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT private.current_public_user_id())
    OR (SELECT private.is_org_member(org_id))
    OR (SELECT private.is_superadmin())
  );

DROP POLICY IF EXISTS "org_members_insert_admin_only" ON public.organization_members;
CREATE POLICY "org_members_insert_admin_only"
  ON public.organization_members FOR INSERT
  TO authenticated
  WITH CHECK (
    ((SELECT private.is_org_admin(org_id)) AND role <> 'owner')
    OR (SELECT private.is_superadmin())
  );

DROP POLICY IF EXISTS "org_members_update_admin_only" ON public.organization_members;
CREATE POLICY "org_members_update_admin_only"
  ON public.organization_members FOR UPDATE
  TO authenticated
  USING (
    (SELECT private.is_org_admin(org_id))
    OR (SELECT private.is_superadmin())
  )
  WITH CHECK (
    ((SELECT private.is_org_admin(org_id)) AND role <> 'owner')
    OR (SELECT private.is_superadmin())
  );

DROP POLICY IF EXISTS "org_members_delete_admin_or_self_leave" ON public.organization_members;
CREATE POLICY "org_members_delete_admin_or_self_leave"
  ON public.organization_members FOR DELETE
  TO authenticated
  USING (
    (SELECT private.is_org_admin(org_id))
    OR user_id = (SELECT private.current_public_user_id())
    OR (SELECT private.is_superadmin())
  );

-- D. public.packages
-- Split anon and authenticated SELECT policies so anon never triggers private.* schema/function initPlans.
DROP POLICY IF EXISTS "packages_select_public_or_owner_or_superadmin" ON public.packages;
DROP POLICY IF EXISTS "packages_select_anon_public" ON public.packages;
CREATE POLICY "packages_select_anon_public"
  ON public.packages FOR SELECT
  TO anon
  USING (visibility = 'public');

DROP POLICY IF EXISTS "packages_select_authenticated" ON public.packages;
CREATE POLICY "packages_select_authenticated"
  ON public.packages FOR SELECT
  TO authenticated
  USING (
    visibility = 'public'
    OR (SELECT private.owns_package_owner_id(owner_id))
    OR (SELECT private.is_superadmin())
  );

DROP POLICY IF EXISTS "packages_insert_authenticated_owner" ON public.packages;
CREATE POLICY "packages_insert_authenticated_owner"
  ON public.packages FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT private.owns_package_owner_id(owner_id))
    OR (SELECT private.is_superadmin())
  );

DROP POLICY IF EXISTS "packages_update_owner_or_superadmin" ON public.packages;
CREATE POLICY "packages_update_owner_or_superadmin"
  ON public.packages FOR UPDATE
  TO authenticated
  USING (
    (SELECT private.owns_package_owner_id(owner_id))
    OR (SELECT private.is_superadmin())
  )
  WITH CHECK (
    (SELECT private.owns_package_owner_id(owner_id))
    OR (SELECT private.is_superadmin())
  );

DROP POLICY IF EXISTS "packages_delete_owner_or_superadmin" ON public.packages;
CREATE POLICY "packages_delete_owner_or_superadmin"
  ON public.packages FOR DELETE
  TO authenticated
  USING (
    (SELECT private.owns_package_owner_id(owner_id))
    OR (SELECT private.is_superadmin())
  );

-- E. public.package_versions
-- Split anon/authenticated SELECT and separate INSERT/UPDATE/DELETE to avoid multiple permissive SELECT policies.
DROP POLICY IF EXISTS "package_versions_select_visible_packages" ON public.package_versions;
DROP POLICY IF EXISTS "package_versions_select_anon_public" ON public.package_versions;
CREATE POLICY "package_versions_select_anon_public"
  ON public.package_versions FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1
      FROM public.packages p
      WHERE p.name = public.package_versions.package_name
        AND p.visibility = 'public'
    )
  );

DROP POLICY IF EXISTS "package_versions_select_authenticated" ON public.package_versions;
CREATE POLICY "package_versions_select_authenticated"
  ON public.package_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.packages p
      WHERE p.name = public.package_versions.package_name
        AND (
          p.visibility = 'public'
          OR (SELECT private.owns_package_owner_id(p.owner_id))
          OR (SELECT private.is_superadmin())
        )
    )
  );

DROP POLICY IF EXISTS "package_versions_write_owner_or_superadmin" ON public.package_versions;
DROP POLICY IF EXISTS "package_versions_insert_owner_or_superadmin" ON public.package_versions;
CREATE POLICY "package_versions_insert_owner_or_superadmin"
  ON public.package_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.packages p
      WHERE p.name = public.package_versions.package_name
        AND (
          (SELECT private.owns_package_owner_id(p.owner_id))
          OR (SELECT private.is_superadmin())
        )
    )
  );

DROP POLICY IF EXISTS "package_versions_update_owner_or_superadmin" ON public.package_versions;
CREATE POLICY "package_versions_update_owner_or_superadmin"
  ON public.package_versions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.packages p
      WHERE p.name = public.package_versions.package_name
        AND (
          (SELECT private.owns_package_owner_id(p.owner_id))
          OR (SELECT private.is_superadmin())
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.packages p
      WHERE p.name = public.package_versions.package_name
        AND (
          (SELECT private.owns_package_owner_id(p.owner_id))
          OR (SELECT private.is_superadmin())
        )
    )
  );

DROP POLICY IF EXISTS "package_versions_delete_owner_or_superadmin" ON public.package_versions;
CREATE POLICY "package_versions_delete_owner_or_superadmin"
  ON public.package_versions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.packages p
      WHERE p.name = public.package_versions.package_name
        AND (
          (SELECT private.owns_package_owner_id(p.owner_id))
          OR (SELECT private.is_superadmin())
        )
    )
  );

-- F. public.api_keys
DROP POLICY IF EXISTS "api_keys_select_owner_or_org_admin" ON public.api_keys;
CREATE POLICY "api_keys_select_owner_or_org_admin"
  ON public.api_keys FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT private.current_public_user_id())
    OR (org_id IS NOT NULL AND (SELECT private.is_org_admin(org_id)))
    OR (SELECT private.is_superadmin())
  );

DROP POLICY IF EXISTS "api_keys_insert_owner" ON public.api_keys;
CREATE POLICY "api_keys_insert_owner"
  ON public.api_keys FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (SELECT private.current_public_user_id())
    AND (org_id IS NULL OR (SELECT private.is_org_member(org_id)))
  );

DROP POLICY IF EXISTS "api_keys_delete_owner_or_org_admin" ON public.api_keys;
CREATE POLICY "api_keys_delete_owner_or_org_admin"
  ON public.api_keys FOR DELETE
  TO authenticated
  USING (
    user_id = (SELECT private.current_public_user_id())
    OR (org_id IS NOT NULL AND (SELECT private.is_org_admin(org_id)))
    OR (SELECT private.is_superadmin())
  );

-- G. public.audit_log
DROP POLICY IF EXISTS "audit_log_select_actor_or_superadmin" ON public.audit_log;
CREATE POLICY "audit_log_select_actor_or_superadmin"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (
    (SELECT private.owns_package_owner_id(actor_id))
    OR (SELECT private.is_superadmin())
  );

DROP POLICY IF EXISTS "audit_log_insert_self_actor" ON public.audit_log;
CREATE POLICY "audit_log_insert_self_actor"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT private.owns_package_owner_id(actor_id))
  );

-- H. public.entitlements (Server-managed via service_role only)
DROP POLICY IF EXISTS "entitlements_select_owner_or_superadmin" ON public.entitlements;
CREATE POLICY "entitlements_select_owner_or_superadmin"
  ON public.entitlements FOR SELECT
  TO authenticated
  USING (
    user_id = (SELECT private.current_public_user_id())
    OR (SELECT private.is_superadmin())
  );

-- I. public.pending_invites (Hide secret `token` column from browser roles)
REVOKE SELECT ON public.pending_invites FROM authenticated;
GRANT SELECT (id, org_id, email, role, invited_by, created_at) ON public.pending_invites TO authenticated;

DROP POLICY IF EXISTS "pending_invites_select_org_admin" ON public.pending_invites;
CREATE POLICY "pending_invites_select_org_admin"
  ON public.pending_invites FOR SELECT
  TO authenticated
  USING (
    (SELECT private.is_org_admin(org_id))
    OR (SELECT private.is_superadmin())
  );

DROP POLICY IF EXISTS "pending_invites_delete_org_admin" ON public.pending_invites;
CREATE POLICY "pending_invites_delete_org_admin"
  ON public.pending_invites FOR DELETE
  TO authenticated
  USING (
    (SELECT private.is_org_admin(org_id))
    OR (SELECT private.is_superadmin())
  );

-- J. public.email_otps & public.test_dummy (Zero anon/authenticated access; service_role only)
REVOKE ALL ON public.email_otps FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.test_dummy FROM PUBLIC, anon, authenticated;
