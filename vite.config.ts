import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  base: './', // Use relative paths for GitHub Pages
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index-new.html',
      output: {
        // Rename index-new.html to index.html in output
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  server: {
    open: true
  }
});
