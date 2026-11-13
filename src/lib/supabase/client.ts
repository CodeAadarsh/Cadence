import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

/**
 * Supabase client for use in Client Components. A new instance is cheap to
 * create; call this from the browser only.
 */
export function createClient() {
  const { url, key } = supabaseEnv();
  return createBrowserClient<Database>(url, key);
}
