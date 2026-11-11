import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const clientEntry = fileURLToPath(new URL('./src/entry-client.tsx', import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    manifest: '.vite/manifest.json',
    rollupOptions: {
      input: { client: clientEntry },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
