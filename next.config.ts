import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'ais-dev-pv5vb63lxx7haaqmizvcro-26432502266.asia-southeast1.run.app',
    'ais-pre-pv5vb63lxx7haaqmizvcro-26432502266.asia-southeast1.run.app',
    '*.asia-southeast1.run.app',
    '*.run.app',
  ],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
