const { withContentlayer } = require("next-contentlayer2");
const { apexWwwRedirects } = require("./config/apex-www-redirect.cjs");

import("./env.mjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return apexWwwRedirects();
  },
  async headers() {
    return [
      {
        source: "/api/widget/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, x-visitor-token" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
      {
        source: "/api/pusher/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, x-visitor-token" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
      {
        source: "/api/mcp",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, DELETE, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization, Mcp-Session-Id, Mcp-Protocol-Version" },
          { key: "Access-Control-Expose-Headers", value: "Mcp-Session-Id" },
          { key: "Access-Control-Max-Age", value: "86400" },
        ],
      },
    ];
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
