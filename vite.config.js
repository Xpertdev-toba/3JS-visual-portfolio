import { defineConfig } from 'vite'

export default defineConfig({
  root: './',
  publicDir: 'public',
  // Use repo name for GitHub Pages; './' works for local dev too
  base: process.env.NODE_ENV === 'production' ? '/portfolio-3js/' : './',
  server: {
    host: true,
    open: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false, // Disable sourcemaps in production for smaller builds
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          physics: ['cannon-es'],
        }
      }
    }
  }
})
