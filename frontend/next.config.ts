import type { NextConfig } from "next";

const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: cloudinaryCloudName
      ? [
          {
            protocol: "https",
            hostname: "res.cloudinary.com",
            port: "",
            pathname: `/${cloudinaryCloudName}/image/upload/**`,
            search: "",
          },
        ]
      : [],
  },
};

export default nextConfig;
