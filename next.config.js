const { withContentlayer } = require("next-contentlayer2");

const {
  securityHeaders,
  helpRedirects,
} = require("./config/security-headers.cjs");
const { apiHostRedirects, cdnHostRedirects } = require("./config/api-host.cjs");

import("./env.mjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return securityHeaders();
  },
  async redirects() {
    // The api and cdn host rules come first, so they win on those hosts.
    return [...apiHostRedirects(), ...cdnHostRedirects(), ...helpRedirects()];
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
