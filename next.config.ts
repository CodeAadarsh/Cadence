import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components (PPR) is intentionally left off: this app is almost
  // entirely per-user dynamic data behind Supabase cookie auth, which reads
  // cookies() on every request. Standard dynamic rendering + Suspense
  // skeletons keeps auth correct while still feeling fluid.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
