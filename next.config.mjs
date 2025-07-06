/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static optimization to prevent Stack Auth build issues
  experimental: {
    // Disable static page generation
    isrMemoryCacheSize: 0,
  },
  // Force dynamic rendering
  generateStaticParams: false,
  // Use standalone output
  output: 'standalone',
  // Disable static export
  trailingSlash: false,
  // Custom build configuration
  generateBuildId: async () => {
    return 'dynamic-' + Date.now();
  },
};

export default nextConfig;
