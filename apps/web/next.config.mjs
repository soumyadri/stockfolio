/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@stockfolio/ui"],
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
