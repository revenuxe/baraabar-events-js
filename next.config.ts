import type { NextConfig } from "next";

// Strangler-fig rollout (docs/nextjs-migration-plan.md §3): any request
// that doesn't match a real route under src/app/** falls through to the
// legacy TanStack Start app. As routes get ported here, Next's own
// filesystem routing takes precedence automatically — nothing to edit in
// this list as phases land.
const nextConfig: NextConfig = {
  async rewrites() {
    const legacyOrigin = process.env.LEGACY_APP_ORIGIN;
    if (!legacyOrigin) return { fallback: [] };

    return {
      fallback: [{ source: "/:path*", destination: `${legacyOrigin}/:path*` }],
    };
  },
};

export default nextConfig;
