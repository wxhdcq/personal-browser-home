import type { NextConfig } from "next";

const isExtensionBuild = process.env.NEXT_PUBLIC_APP_TARGET === "extension";

const nextConfig: NextConfig = {
  ...(isExtensionBuild
    ? {
        distDir: ".next-extension",
        output: "export" as const,
        trailingSlash: true,
      }
    : {}),
  images: {
    ...(isExtensionBuild ? { unoptimized: true } : {}),
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
