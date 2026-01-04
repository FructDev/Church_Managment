import type { NextConfig } from "next";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ycoznbpfcgsgiwdoofuo.supabase.co", // <-- ¡Este es tu hostname!
        port: "",
        pathname: "/storage/v1/object/public/**", // Permite todo tu storage
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
      },
    ],
  },
};

// Note: PWA plugin is temporarily disabled due to incompatibility with Next.js 16.
// export default withPWA(nextConfig);
export default nextConfig;
