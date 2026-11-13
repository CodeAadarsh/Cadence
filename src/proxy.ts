import { NextResponse, type NextRequest } from "next/server";

import { missingSupabaseEnv } from "@/lib/supabase/env";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 16 renamed Middleware to Proxy. This runs before every matched
 * request to keep the Supabase session fresh and guard app routes.
 */
export async function proxy(request: NextRequest) {
  // Without Supabase credentials every request would throw deep inside the
  // auth client and surface as an opaque 500. Fail loudly and legibly instead.
  const missing = missingSupabaseEnv();
  if (missing.length) {
    return new NextResponse(
      `Cadence is not configured.\n\n` +
        `Missing environment variable(s):\n` +
        missing.map((m) => `  - ${m}`).join("\n") +
        `\n\nSet these in your host's environment settings ` +
        `(Vercel → Settings → Environment Variables), then redeploy.\n` +
        `Values come from Supabase → Project Settings → API.\n`,
      { status: 503, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and images.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
