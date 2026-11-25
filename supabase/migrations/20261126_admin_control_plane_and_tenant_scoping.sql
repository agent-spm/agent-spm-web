-- ============================================================================
-- Agent SPM Web — Admin Control Plane, Moderation, Feature Flags & Org Scoping
-- Idempotent migration for project pbcnraifbapghtcavwqs
-- ============================================================================

-- 1. Account & organization suspension status
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_status_check'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT users_status_check CHECK (status IN ('active', 'suspended'));
  END IF;
END $$;

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'organizations_status_check'
  ) THEN
    ALTER TABLE public.organizations
      ADD CONSTRAINT organizations_status_check CHECK (status IN ('active', 'suspended'));
  END IF;
END $$;

-- 2. Package organization ownership, lifecycle status & quarantine reason
ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS quarantine_reason text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'packages_status_check'
  ) THEN
    ALTER TABLE public.packages
      ADD CONSTRAINT packages_status_check CHECK (status IN ('published', 'draft', 'deprecated', 'quarantined'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_packages_org_id ON public.packages (org_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON public.packages (status);

-- Backfill org_id from scoped package names (@slug/pkg)
UPDATE public.packages p
SET org_id = o.id
FROM public.organizations o
WHERE p.org_id IS NULL
  AND p.name LIKE '@%/%'
  AND lower(split_part(substring(p.name FROM 2), '/', 1)) = lower(o.slug);

-- Backfill unscoped packages from verified package owner memberships
UPDATE public.packages p
SET org_id = om.org_id
FROM public.users u
JOIN public.organization_members om ON om.user_id = u.id AND om.role = 'owner'
WHERE p.org_id IS NULL
  AND (
    p.owner_id = u.supabase_uid
    OR p.owner_id = u.id::text
    OR EXISTS (
      SELECT 1
      FROM auth.identities i
      WHERE i.user_id::text = u.supabase_uid
        AND i.provider = 'github'
        AND p.owner_id = i.provider_id
    )
  );

-- Update package RLS policies to enforce quarantine + org-scoped visibility cleanly
DROP POLICY IF EXISTS "packages_select_anon_public" ON public.packages;
CREATE POLICY "packages_select_anon_public"
  ON public.packages FOR SELECT
  TO anon
  USING (visibility = 'public' AND status <> 'quarantined');

DROP POLICY IF EXISTS "packages_select_authenticated" ON public.packages;
CREATE POLICY "packages_select_authenticated"
  ON public.packages FOR SELECT
  TO authenticated
  USING (
    (visibility = 'public' AND status <> 'quarantined')
    OR (SELECT private.owns_package_owner_id(owner_id))
    OR (org_id IS NOT NULL AND (SELECT private.is_org_member(org_id)))
    OR (SELECT private.is_superadmin())
  );

DROP POLICY IF EXISTS "packages_update_owner_or_superadmin" ON public.packages;
CREATE POLICY "packages_update_owner_or_superadmin"
  ON public.packages FOR UPDATE
  TO authenticated
  USING (
    (SELECT private.owns_package_owner_id(owner_id))
    OR (org_id IS NOT NULL AND (SELECT private.is_org_admin(org_id)))
    OR (SELECT private.is_superadmin())
  )
  WITH CHECK (
    (SELECT private.owns_package_owner_id(owner_id))
    OR (org_id IS NOT NULL AND (SELECT private.is_org_admin(org_id)))
    OR (SELECT private.is_superadmin())
  );

DROP POLICY IF EXISTS "packages_delete_owner_or_superadmin" ON public.packages;
CREATE POLICY "packages_delete_owner_or_superadmin"
  ON public.packages FOR DELETE
  TO authenticated
  USING (
    (SELECT private.owns_package_owner_id(owner_id))
    OR (org_id IS NOT NULL AND (SELECT private.is_org_admin(org_id)))
    OR (SELECT private.is_superadmin())
  );

-- 3. Persistent feature flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  rollout_percent integer NOT NULL DEFAULT 100 CHECK (rollout_percent >= 0 AND rollout_percent <= 100),
  target text NOT NULL DEFAULT 'All',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "feature_flags_select_authenticated" ON public.feature_flags;
CREATE POLICY "feature_flags_select_authenticated"
  ON public.feature_flags FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "feature_flags_write_superadmin" ON public.feature_flags;
CREATE POLICY "feature_flags_write_superadmin"
  ON public.feature_flags FOR ALL
  TO authenticated
  USING ((SELECT private.is_superadmin()))
  WITH CHECK ((SELECT private.is_superadmin()));

INSERT INTO public.feature_flags (name, description, enabled, rollout_percent, target)
VALUES
  ('realtime-collab', 'Real-time multi-agent editing and lock negotiation', true, 100, 'All'),
  ('ai-skill-recommendations', 'Vector-based skill graph semantic recommendations', true, 100, 'All'),
  ('enterprise-sso-saml', 'Okta and Azure AD enterprise SAML 2.0 gateway', true, 100, 'Enterprise'),
  ('new-publish-wizard', '4-step stepper with AST secret linting pipeline', true, 100, 'All'),
  ('spm-cli-v3', 'Rust-native zero-allocation package resolver CLI', true, 100, 'All'),
  ('bulk-skill-export', 'Asynchronous organization ZIP data exporter', true, 100, 'All')
ON CONFLICT (name) DO NOTHING;

-- 4. Persistent platform incidents & maintenance settings
CREATE TABLE IF NOT EXISTS public.platform_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  severity text NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  title text NOT NULL,
  details text NOT NULL DEFAULT '',
  region text NOT NULL DEFAULT 'Global Edge',
  acknowledged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_incidents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_incidents_superadmin_only" ON public.platform_incidents;
CREATE POLICY "platform_incidents_superadmin_only"
  ON public.platform_incidents FOR ALL
  TO authenticated
  USING ((SELECT private.is_superadmin()))
  WITH CHECK ((SELECT private.is_superadmin()));

CREATE TABLE IF NOT EXISTS public.platform_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "platform_settings_select_public" ON public.platform_settings;
CREATE POLICY "platform_settings_select_public"
  ON public.platform_settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "platform_settings_write_superadmin" ON public.platform_settings;
CREATE POLICY "platform_settings_write_superadmin"
  ON public.platform_settings FOR ALL
  TO authenticated
  USING ((SELECT private.is_superadmin()))
  WITH CHECK ((SELECT private.is_superadmin()));

INSERT INTO public.platform_settings (key, value)
VALUES (
  'maintenance_banner',
  '{"enabled": false, "message": "Agent SPM Scheduled Maintenance in progress. Publishing is temporarily queued."}'::jsonb
)
ON CONFLICT (key) DO NOTHING;


-- 5. Real agent MCP / runtime telemetry events table (for /app/fleet)
CREATE TABLE IF NOT EXISTS public.agent_telemetry_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  api_key_id uuid REFERENCES public.api_keys(id) ON DELETE SET NULL,
  package_name text NOT NULL DEFAULT '@workspace/agent-skill',
  agent_id text NOT NULL,
  agent_role text NOT NULL DEFAULT 'Autonomous Runner',
  tool_name text NOT NULL,
  method text NOT NULL DEFAULT 'tools/call',
  status_code integer NOT NULL DEFAULT 200,
  latency_ms integer NOT NULL DEFAULT 0,
  tokens integer NOT NULL DEFAULT 0,
  client_ip text NOT NULL DEFAULT '0.0.0.0',
  shield_status text NOT NULL DEFAULT 'PASS',
  request_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_telemetry_org_created
  ON public.agent_telemetry_events (org_id, created_at DESC);

ALTER TABLE public.agent_telemetry_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agent_telemetry_select_member_or_superadmin" ON public.agent_telemetry_events;
CREATE POLICY "agent_telemetry_select_member_or_superadmin"
  ON public.agent_telemetry_events FOR SELECT
  TO authenticated
  USING (
    (SELECT private.is_org_member(org_id))
    OR (SELECT private.is_superadmin())
  );

DROP POLICY IF EXISTS "agent_telemetry_insert_member_or_superadmin" ON public.agent_telemetry_events;
CREATE POLICY "agent_telemetry_insert_member_or_superadmin"
  ON public.agent_telemetry_events FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT private.is_org_member(org_id))
    OR (SELECT private.is_superadmin())
  );

DROP POLICY IF EXISTS "agent_telemetry_delete_admin_or_superadmin" ON public.agent_telemetry_events;
CREATE POLICY "agent_telemetry_delete_admin_or_superadmin"
  ON public.agent_telemetry_events FOR DELETE
  TO authenticated
  USING (
    (SELECT private.is_org_admin(org_id))
    OR (SELECT private.is_superadmin())
  );

-- 6. Workspace webhooks persistence table (for /app/settings/integrations)
CREATE TABLE IF NOT EXISTS public.workspace_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  url text NOT NULL,
  events text[] NOT NULL DEFAULT ARRAY['skill.published']::text[],
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Paused')),
  secret_prefix text NOT NULL,
  last_status_code integer,
  last_triggered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workspace_webhooks_org
  ON public.workspace_webhooks (org_id, created_at DESC);

ALTER TABLE public.workspace_webhooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "workspace_webhooks_member_select" ON public.workspace_webhooks;
CREATE POLICY "workspace_webhooks_member_select"
  ON public.workspace_webhooks FOR SELECT
  TO authenticated
  USING (
    (SELECT private.is_org_member(org_id))
    OR (SELECT private.is_superadmin())
  );

DROP POLICY IF EXISTS "workspace_webhooks_admin_write" ON public.workspace_webhooks;
CREATE POLICY "workspace_webhooks_admin_write"
  ON public.workspace_webhooks FOR ALL
  TO authenticated
  USING (
    (SELECT private.is_org_admin(org_id))
    OR (SELECT private.is_superadmin())
  )
  WITH CHECK (
    (SELECT private.is_org_admin(org_id))
    OR (SELECT private.is_superadmin())
  );
