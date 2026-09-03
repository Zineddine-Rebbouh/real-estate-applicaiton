import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Next.js 16 requires an explicit allowlist; 90 keeps hero/landing imagery sharp.
    qualities: [75, 90],
  },
};

export default nextConfig;
