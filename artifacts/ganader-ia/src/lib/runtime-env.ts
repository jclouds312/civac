/** Read public configuration in both Vite/Replit and Next/Vercel builds. */
export function publicEnv(viteKey: string, nextKey: string): string {
  const viteEnv = (import.meta as ImportMeta & {
    env?: Record<string, string | undefined>;
  }).env;
  if (viteEnv?.[viteKey]) return viteEnv[viteKey] as string;

  if (typeof process !== "undefined" && process.env?.[nextKey]) {
    return process.env[nextKey] as string;
  }

  return "";
}