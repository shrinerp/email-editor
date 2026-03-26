import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // @xero/xui is installed as a symlinked local path and ships CJS files.
    // List each subpath import explicitly — the root entry alone doesn't
    // cause Vite to pre-bundle deep imports.
    include: [
      '@xero/xui/react/selectbox',
      '@xero/xui/react/textinput',
      '@xero/xui/react/button',
    ],
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
