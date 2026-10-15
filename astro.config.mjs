// @ts-check
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://idnwired.com",
  output: "server",
  adapter: vercel(),
  integrations: [sitemap()],
  vite: {
    optimizeDeps: {
      include: ["three"],
    },
  },
});
