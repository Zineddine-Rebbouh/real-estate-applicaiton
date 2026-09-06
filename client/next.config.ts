import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next.js 16 requires an explicit allowlist; 90 keeps hero/landing imagery sharp.
    qualities: [75, 90],
  },
  async redirects() {
    // Legacy tenant routes (pre-/tenant prefix) → new locations.
    const tenantRoutes = [
      "overview",
      "applications",
      "residence",
      "favorites",
      "billing",
      "payment-methods",
      "explore",
      "rentals",
    ];
    return [
      ...tenantRoutes.map((route) => ({
        source: `/${route}`,
        destination: `/tenant/${route}`,
        permanent: false,
      })),
      {
        source: "/rentals/:id",
        destination: "/tenant/rentals/:id",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
