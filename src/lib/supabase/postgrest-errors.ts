interface SupabaseErrorLike {
  code?: string | null;
  message?: string | null;
  details?: string | null;
  hint?: string | null;
}

/**
 * Checks whether a Supabase / PostgREST error indicates a missing table
 * (`42P01` in raw Postgres or `PGRST205` in PostgREST schema cache).
 */
export function isMissingTableError(
  err: SupabaseErrorLike | null | undefined,
  tableName?: string
): boolean {
  if (!err) return false;
  if (err.code === "42P01" || err.code === "PGRST205") {
    return true;
  }
  const msg = `${err.message || ""} ${err.details || ""}`.toLowerCase();
  const hasMissingPhrase =
    msg.includes("schema cache") ||
    msg.includes("does not exist") ||
    msg.includes("could not find the table");

  if (!hasMissingPhrase) return false;
  return tableName ? msg.includes(tableName.toLowerCase()) : true;
}

/**
 * Checks whether a Supabase / PostgREST error indicates a missing column
 * (`42703` in raw Postgres or `PGRST204` in PostgREST schema cache).
 */
export function isMissingColumnError(
  err: SupabaseErrorLike | null | undefined,
  columnName?: string
): boolean {
  if (!err) return false;
  if (err.code === "42703" || err.code === "PGRST204") {
    return true;
  }
  const msg = `${err.message || ""} ${err.details || ""}`.toLowerCase();
  const hasMissingPhrase =
    msg.includes("schema cache") ||
    msg.includes("does not exist") ||
    msg.includes("could not find");

  if (!hasMissingPhrase) return false;
  return columnName ? msg.includes(columnName.toLowerCase()) : true;
}
