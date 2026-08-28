import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2022',
    rollupOptions: { output: { entryFileNames: 'assets/app.js', chunkFileNames: 'assets/[name].js', assetFileNames: 'assets/[name][extname]' } }
  },
  server: { host: '0.0.0.0' },
  test: { exclude: ['e2e/**', 'node_modules/**'] }
});
