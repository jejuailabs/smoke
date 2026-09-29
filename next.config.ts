import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.SITE_PREVIEW_EXPORT === "1" ? {
    output: "export" as const,
    basePath: "/preview",
    trailingSlash: true,
  } : {}),
};

export default nextConfig;
