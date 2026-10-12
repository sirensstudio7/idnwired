// @ts-check
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  site: "https://idnwired.com",
  integrations: [sitemap()],
  vite: {
    optimizeDeps: {
      include: ["three"],
    },
  },
});
