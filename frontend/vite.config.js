import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'three/examples/jsm/libs/draco': fileURLToPath(new URL('./node_modules/three/examples/jsm/libs/draco', import.meta.url)),
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if(id.includes('draco')) {
            return 'draco';
          }
        }
      }
    }
  }
})
