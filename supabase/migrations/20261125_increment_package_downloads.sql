-- Atomic download counter RPC for scoped/unscoped registry mirrors.
-- Called by Next.js /api/packages/download (service role) and resolve-package Edge Function.

CREATE OR REPLACE FUNCTION public.increment_package_downloads(
  p_package_id uuid,
  p_owner_id text DEFAULT NULL,
  p_github_repo text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_target_name text;
  v_leaf_name text;
  v_new_total integer := 0;
BEGIN
  SELECT name INTO v_target_name
  FROM public.packages
  WHERE id = p_package_id;

  IF v_target_name IS NULL THEN
    RETURN 0;
  END IF;

  v_leaf_name := split_part(
    v_target_name,
    '/',
    CASE WHEN v_target_name LIKE '@%/%' THEN 2 ELSE 1 END
  );

  IF p_owner_id IS NOT NULL AND btrim(p_owner_id) <> ''
     AND p_github_repo IS NOT NULL AND btrim(p_github_repo) <> '' THEN
    WITH updated AS (
      UPDATE public.packages
      SET total_downloads = COALESCE(total_downloads, 0) + 1
      WHERE id = p_package_id
         OR (
           owner_id = p_owner_id
           AND github_repo = p_github_repo
           AND split_part(name, '/', CASE WHEN name LIKE '@%/%' THEN 2 ELSE 1 END) = v_leaf_name
         )
      RETURNING id, total_downloads
    )
    SELECT total_downloads INTO v_new_total
    FROM updated
    WHERE id = p_package_id
    LIMIT 1;
  ELSE
    UPDATE public.packages
    SET total_downloads = COALESCE(total_downloads, 0) + 1
    WHERE id = p_package_id
    RETURNING total_downloads INTO v_new_total;
  END IF;

  RETURN COALESCE(v_new_total, 0);
END;
$$;

REVOKE ALL ON FUNCTION public.increment_package_downloads(uuid, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_package_downloads(uuid, text, text) TO service_role;
