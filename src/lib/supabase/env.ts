/**
 * Supabase environment resolution.
 *
 * `NEXT_PUBLIC_*` vars are inlined by the bundler only when referenced as
 * literal property accesses, so they are read at module scope here rather than
 * through a dynamic lookup. Validation is deferred to call time so a missing
 * value fails with an actionable message instead of breaking the build.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export type SupabaseEnv = { url: string; key: string };

export function missingSupabaseEnv(): string[] {
  const missing: string[] = [];
  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!key) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  return missing;
}

export function supabaseEnv(): SupabaseEnv {
  const missing = missingSupabaseEnv();
  if (missing.length) {
    throw new Error(
      `[Cadence] Missing environment variable(s): ${missing.join(", ")}. ` +
        `Set them on your host (Vercel → Settings → Environment Variables) ` +
        `and redeploy. Values come from Supabase → Project Settings → API.`,
    );
  }
  return { url: url as string, key: key as string };
}
