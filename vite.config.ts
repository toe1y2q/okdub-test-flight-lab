import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'lovable-uploads/3e7c2c9a-0c07-4a59-afbc-c68bc09a5223.png'],
      manifest: {
        name: 'Okdub Casino',
        short_name: 'Okdub',
        description: 'The Future of Web3 Testing',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/lovable-uploads/3e7c2c9a-0c07-4a59-afbc-c68bc09a5223.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/lovable-uploads/3e7c2c9a-0c07-4a59-afbc-c68bc09a5223.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        navigateFallbackDenylist: [/^\/~oauth/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
