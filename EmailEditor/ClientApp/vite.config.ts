import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // XUI's CSS contains selectors that Vite 8's lightningcss minifier
    // can't parse (pseudo-element followed by pseudo-class). Use esbuild
    // minifier for CSS instead.
    cssMinify: false,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5261',
        changeOrigin: true,
      },
    },
  },
})
