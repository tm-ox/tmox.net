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
      name: "Schibsted Grotesk",
      cssVariable: "--font-schibsted",
      weights: ["400 800"],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["sans-serif"],
    },
    {
      provider: fontProviders.google(),
      name: "IBM Plex Mono",
      cssVariable: "--font-plex-mono",
      weights: [400, 500],
      styles: ["normal"],
      subsets: ["latin"],
      fallbacks: ["monospace"],
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
