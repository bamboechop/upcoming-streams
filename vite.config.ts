import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  const isProduction = command === 'build'

  const buildInputs = {
    component: resolve(import.meta.dirname, 'video_component.html'),
    config: resolve(import.meta.dirname, 'config.html'),
    mobile: resolve(import.meta.dirname, 'mobile.html'),
    overlay: resolve(import.meta.dirname, 'video_overlay.html'),
    panel: resolve(import.meta.dirname, 'panel.html'),
  }

  const developmentInputs = {
    ...buildInputs,
    main: resolve(import.meta.dirname, 'index.html'),
  }

  return {
    base: isProduction ? './' : '/',
    build: {
      rolldownOptions: {
        input: isProduction ? buildInputs : developmentInputs,
        output: {
          assetFileNames: '[name]-[hash:8].[ext]',
          chunkFileNames: '[name]-[hash:8].js',
          entryFileNames: '[name]-[hash:8].js',
        },
      },
      sourcemap: !isProduction,
    },
    plugins: [
      tailwindcss(),
      vue(),
      vueDevTools(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  }
})
