
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const useHttps = env.VITE_LOCAL_SSL === 'true'

  const sslDir = path.resolve(__dirname, 'ssl')
  const keyPath = path.join(sslDir, 'localhost.key')
  const certPath = path.join(sslDir, 'localhost.crt')

  let httpsOptions = undefined
  if (useHttps && fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    }
  }

  return {
    plugins: [vue()],
    server: {
      port: 5644,
      host: mode === 'production' ? 'localhost' : '192.168.0.201',
      strictPort: true,
      https: httpsOptions,
      hmr: {
        host: mode === 'production' ? 'localhost' : '192.168.0.201',
        protocol: useHttps ? 'wss' : 'ws',
        clientPort: 5644
      },
      proxy: {
        '/api': {
          target: `http://${mode === 'production' ? 'localhost' : '192.168.0.201'}:3391`,
          changeOrigin: true,
          secure: false
        }
      },
      headers: {
        'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        'Cross-Origin-Embedder-Policy': 'require-corp'
      }
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    }
  }
})
