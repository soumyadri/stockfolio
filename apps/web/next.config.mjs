/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@stockfolio/ui"],
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["@stockfolio/ui"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
