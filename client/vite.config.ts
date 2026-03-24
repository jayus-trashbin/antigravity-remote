import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Antigravity Remote',
        short_name: 'AntiRemote',
        theme_color: '#C8683A',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ],
      },
    }),
  ],
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'https://localhost:3333',
        secure: false,
        changeOrigin: true,
      },
      '/ws': {
        target: 'wss://localhost:3333',
        secure: false,
        ws: true,
      },
    },
  },
});
