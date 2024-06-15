import { defineConfig } from 'astro/config';
import db from "@astrojs/db";
import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  output: 'server',
  vite: {
    optimizeDeps: {
      exclude: ["astro:db"]
    }
  },
  security: {
    checkOrigin: true
  },
  adapter: vercel(),
  integrations: [db()]
});