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
  // Removed serverExternalPackages to fix Stack Auth module resolution
  // Webpack configuration to handle extensionless imports
  webpack: (config, { isServer }) => {
    // Add .js extension resolution for ES modules
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.mjs': ['.mjs', '.js'],
    };
    
    // Ensure proper module resolution for Stack Auth packages
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    return config;
  },
};

export default nextConfig;
