import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const REPO = 'control-prestamos-pro'

export default defineConfig(({ command }) => {
  const base = command === 'build' ? `/${REPO}/` : '/'

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'ControlPréstamos Pro',
          short_name: 'CtrlPréstamos',
          description: 'Sistema de control de préstamos y créditos',
          theme_color: '#1e40af',
          background_color: '#f8fafc',
          display: 'standalone',
          orientation: 'portrait',
          start_url: `/${REPO}/`,
          scope: `/${REPO}/`,
          icons: [
            { src: `/${REPO}/icon-192.png`, sizes: '192x192', type: 'image/png' },
            { src: `/${REPO}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
          navigateFallback: `/${REPO}/index.html`,
          navigateFallbackAllowlist: [new RegExp(`^/${REPO}`)],
        },
      }),
    ],
  }
})
