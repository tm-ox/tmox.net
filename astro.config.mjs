import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import partytown from "@astrojs/partytown";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://tmox.net",
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Plus Jakarta Sans",
      cssVariable: "--font-jakarta",
      weights: ["200 800"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["sans-serif"],
    },
  ],
  redirects: {
    "/work/01-logos": "/work/logos",
    "/work/02-tg": "/work/triplegoal",
  },
  prefetch: { prefetchAll: false, defaultStrategy: "hover" },
  integrations: [
    icon(),
    sitemap({
      filter: (page) => !/\/(sent|404)\/?$/.test(page),
    }),
    partytown({ config: { forward: ["dataLayer.push"] } }),
  ],
  vite: { plugins: [tailwindcss()] },
});
