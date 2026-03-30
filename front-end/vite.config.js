import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      includeAssets: ['images/icons/*.png', 'favicon.png'],
      manifest: {
        name: 'PARKIN — Sistem Parkir Cerdas Terintegrasi',
        short_name: 'PARKIN',
        description: 'Monitoring ketersediaan parkir real-time berbasis AI YOLO dengan notifikasi cerdas',
        theme_color: '#0B1426',
        background_color: '#0B1426',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['utilities', 'productivity'],
        icons: [
          {
            src: '/images/icons/maskable_icon_x48.png',
            sizes: '48x48',
            type: 'image/png'
          },
          {
            src: '/images/icons/maskable_icon_x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/images/icons/icon-x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/images/icons/maskable_icon_x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/images/icons/maskable_icon_x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: '/images/icons/maskable_icon_x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/images/icons/maskable_icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          // TODO: Add screenshots Wide
          {
            src: '/images/screenshots/Macbook-Air-(1).png',
            sizes: '1920x1043',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: '/images/screenshots/Macbook-Air-(2).png',
            sizes: '1920x1043',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: '/images/screenshots/Macbook-Air-(3).png',
            sizes: '1920x1043',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: '/images/screenshots/Macbook-Air-(4).png',
            sizes: '1920x1043',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: '/images/screenshots/Macbook-Air-(5).png',
            sizes: '1920x1043',
            type: 'image/png',
            form_factor: 'wide'
          },
          {
            src: '/images/screenshots/Macbook-Air-(6).png',
            sizes: '1920x1043',
            type: 'image/png',
            form_factor: 'wide'
          },
          // TODO: Add screenshots Vertical
          // Narrow
          {
            src: '/images/screenshots/Samsung-Galaxy-S20.png',
            sizes: '1080x2280',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: '/images/screenshots/Samsung-Galaxy-S20-(1).png',
            sizes: '1080x2280',
            type: 
            'image/png',
            form_factor: 'narrow'
          },
          {
            src: '/images/screenshots/iPhone-14-Plus-(3).png',
            sizes: '1080x2280',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: '/images/screenshots/iPhone-14-Plus-(4).png',
            sizes: '1080x2280',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: '/images/screenshots/Samsung-Galaxy-S20-(2).png',
            sizes: '1080x2280',
            type: 'image/png',
            form_factor: 'narrow'
          },
          {
            src: '/images/screenshots/iPhone-14-Plus-(5).png',
            sizes: '1080x2280',
            type: 'image/png',
            form_factor: 'narrow'
          },
        ]
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        rollupFormat: 'iife',
        maximumFileSizeToCacheInBytes: 3000000 
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true
      }
    }
  }
})