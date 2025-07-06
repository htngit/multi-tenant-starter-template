/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use standalone output for better deployment
  output: 'standalone',
  // Disable static export
  trailingSlash: false,
  // Custom build configuration
  generateBuildId: async () => {
    return 'dynamic-' + Date.now();
  },
  // Server external packages for Stack Auth
  serverExternalPackages: ['@stackframe/stack'],
};

export default nextConfig;
