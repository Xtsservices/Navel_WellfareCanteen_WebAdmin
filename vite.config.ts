// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     host: true,
//     port: 5173,
//     allowedHosts: ['welfarecanteen.in'],
//   },
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'log-public-naval-requests',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url && req.url.includes('/public/Naval')) {
            console.log('🚨 /public/Naval requested from:', req.headers.referer || 'unknown');
          }
          next();
        });
      }
    }
  ],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['welfarecanteen.in'],
    fs: {
      allow: [
        // allow serving from the project root
        process.cwd()
      ]
    }
  }
})
