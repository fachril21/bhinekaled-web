/** Deteksi Postgres unique violation (error code 23505) dari respons @supabase/supabase-js. */
export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}
