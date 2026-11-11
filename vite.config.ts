import { fileURLToPath } from 'node:url';
import { getPortraitAvailability } from './scripts/portrait-assets.mjs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const clientEntry = fileURLToPath(new URL('./src/entry-client.tsx', import.meta.url));

function portraitAvailabilityPlugin(): Plugin {
  let serving = false;
  let publicDirectory: string | false = false;

  return {
    name: 'portfolio-portrait-availability',
    configResolved(config) {
      serving = config.command === 'serve';
      publicDirectory = config.publicDir;
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        if (!serving) return html;

        const portraitAvailable = await getPortraitAvailability(publicDirectory);
        const rootMount = '<div id="root"></div>';
        if (!html.includes(rootMount)) {
          throw new Error('The Vite HTML template is missing its empty #root mount.');
        }

        return html.replace(
          rootMount,
          `<div id="root" data-portrait-available="${portraitAvailable}"></div>`,
        );
      },
    },
  };
}

export default defineConfig({
  plugins: [portraitAvailabilityPlugin(), react(), tailwindcss()],
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
