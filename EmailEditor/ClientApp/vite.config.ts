import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // @xero/xui ships CJS in react/ and ESM in react-es6/.
      // TypeScript resolves types from react/ (.d.ts files live there),
      // but Vite must serve the ESM version to avoid CJS/default-export issues.
      {
        find: /^@xero\/xui\/react\//,
        replacement: '@xero/xui/react-es6/',
      },
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
