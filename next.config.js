const { withContentlayer } = require("next-contentlayer2");
const { apexWwwRedirects } = require("./config/apex-www-redirect.cjs");
const {
  securityHeaders,
  helpRedirects,
} = require("./config/security-headers.cjs");

import("./env.mjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async redirects() {
    return [...apexWwwRedirects(), ...helpRedirects()];
  },
  async headers() {
    return securityHeaders();
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "randomuser.me",
      },
    ],
  },
  serverExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  turbopack: {},
};

module.exports = withContentlayer(nextConfig);
