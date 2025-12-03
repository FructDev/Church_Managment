import type { NextConfig } from "next";

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
    ],
  },
};

export default nextConfig;
