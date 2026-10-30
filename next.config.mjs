import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  transpilePackages: [
    "@workspace/api-client-react",
    "@workspace/api-zod",
    "@workspace/db",
  ],
  webpack(config) {
    config.resolve.alias["@"] = path.join(rootDir, "artifacts/ganader-ia/src");
    config.resolve.alias["@assets"] = path.join(rootDir, "attached_assets");
    return config;
  },
};

export default nextConfig;