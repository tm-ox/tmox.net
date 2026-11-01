import { defineConfig, fontProviders } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import alpinejs from "@astrojs/alpinejs";
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
      cssVariable: "--font-jakarta-sans",
      weights: [200, 300, 400, 500, 600, 700, 800],
      styles: ["normal", "italic"],
      fallbacks: ["sans-serif"],
    },
  ],
  prefetch: { prefetchAll: true },
  integrations: [
    alpinejs({ entrypoint: "/src/alpine.ts" }),
    icon(),
    sitemap(),
    partytown({ config: { forward: ["dataLayer.push"] } }),
  ],
  vite: { plugins: [tailwindcss()] },
});
