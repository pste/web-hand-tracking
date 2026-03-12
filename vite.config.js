import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: '8081'
  },
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({ 
      registerType: 'autoUpdate',
      manifest: {
        name: 'Gesture Reader App',
        short_name: 'JJKgra',
        description: 'A gesture detector and recognizer app built as PWA',
        theme_color: '#242424',
      }
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
