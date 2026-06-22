import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // T3N SDK loads its .wasm component via `new URL(..., import.meta.url)` +
  // fs.readFile. Bundling that through webpack produces a URL instance from
  // a different realm than Node's native one, which fails Node's internal
  // fs URL check. Keep these unbundled so Node loads them natively.
  serverExternalPackages: [
    "@terminal3/t3n-sdk",
    "@bytecodealliance/jco",
    "@bytecodealliance/preview2-shim",
  ],
  // @metamask/sdk (pulled in via wagmi/RainbowKit) optionally imports React
  // Native's async-storage, which doesn't exist/apply in a browser bundle.
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
    };
    return config;
  },
};

export default nextConfig;
