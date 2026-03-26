import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // @xero/xui is installed as a symlinked local path and ships CJS files.
    // Without explicit inclusion, Vite serves them raw via /@fs/ and the
    // browser fails to parse `exports`. Forcing pre-bundling lets esbuild
    // convert CJS → ESM before the browser sees it.
    include: ['@xero/xui'],
  },
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
