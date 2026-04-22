/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allows build to succeed even if there are ESLint warnings
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Allows build to succeed even if there are type errors (last resort safety net)
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.igdb.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

module.exports = nextConfig;
