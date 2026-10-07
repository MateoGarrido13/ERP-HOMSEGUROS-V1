import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/cotizar",
        permanent: false,
      },
    ]
  },
}

export default nextConfig;
