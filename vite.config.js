import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves the app under /talo-guidebook/. Cloudflare serves it at
  // the domain root, so the Cloudflare build (DEPLOY_TARGET=cloudflare, set by
  // `npm run build:cf`) uses '/'. Default build stays on the GitHub Pages base
  // so the existing `npm run deploy` is unaffected.
  base: process.env.DEPLOY_TARGET === 'cloudflare'
    ? '/'
    : (command === 'build' ? '/talo-guidebook/' : '/'),
  server: {
    port: 5175,
    strictPort: true,
  },
}))
