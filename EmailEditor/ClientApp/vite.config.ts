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
  optimizeDeps: {
    // Force esbuild to pre-bundle these (after alias resolution they become
    // react-es6/* entries). Pre-bundling converts any remaining internal CJS
    // helpers (e.g. react-es6/helpers/flagDefinitions.js) to ESM so the
    // browser never sees them raw via /@fs/.
    include: [
      '@xero/xui/react/textinput',
      '@xero/xui/react/selectbox',
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
