import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  optimizeFonts: false,
  eslint: {
    // These warnings come from upstream LiveKit/AI UI components, not our code.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
