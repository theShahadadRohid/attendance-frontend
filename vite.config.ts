import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    VitePWA({
      registerType: "prompt",

      manifest: {
        name: "Lead Bangladesh Attendance",
        short_name: "Attendance",
        description: "Employee attendance management system",

        theme_color: "#F40026",
        background_color: "#ffffff",

        display: "standalone",
        orientation: "portrait",
        start_url: "/",

        icons: [
          {
            src: "/icons/lead.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/lead.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/lead.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
});
