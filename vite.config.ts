import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Web (Hatchable) is served from the root. Capacitor builds can set VITE_BASE=./ later.
  base: process.env.VITE_BASE ?? '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Inline registration keeps the app a single classic-script bundle (see build.output).
      injectRegister: 'inline',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Strażnik Trasy',
        short_name: 'Strażnik',
        description: 'Gry w podróży dla całego auta — radar, tablice, czarne historie i wyzwania.',
        lang: 'pl',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        // Bundle names are stable (no hash), so every file must carry a content
        // revision — otherwise an installed app would never pick up a new deploy.
        dontCacheBustURLsMatching: /(?!)/,
        navigateFallback: 'index.html',
      },
    }),
  ],
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    // Emit a real stylesheet (linked in <head>) instead of JS-injected CSS: no flash, no shift.
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // Stable file names keep the Hatchable upload set predictable between deploys.
        // Hatchable's deploy validator parses public JS as classic scripts, so ship one
        // IIFE bundle with no import/export/import.meta.
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});
