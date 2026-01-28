import withSerwistInit from "@serwist/next";

if (!process.env.SERWIST_SUPPRESS_TURBOPACK_WARNING) {
  process.env.SERWIST_SUPPRESS_TURBOPACK_WARNING = "1";
}

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
};

export default withSerwist(nextConfig);
