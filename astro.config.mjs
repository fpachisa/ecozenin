import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://ecozenin.com',
  trailingSlash: 'never',
  // Emit register.html rather than register/index.html so Firebase Hosting's
  // cleanUrls serves it at /register.
  build: { format: 'file' },
  server: { port: 4321 },
  vite: {
    server: {
      // `npm run dev` forwards the form to the Functions emulator.
      proxy: {
        '/api/register': {
          target: 'http://127.0.0.1:5001',
          rewrite: () => '/demo-ecozenin/us-central1/registerWarranty',
        },
      },
    },
  },
});
