import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: './',
    server: {
        host: '0.0.0.0', // Listen on all network interfaces for LAN access
        port: 5173,
        strictPort: false,
        hmr: {
            // Disable HMR overlay in production
            overlay: false
        }
    },
    build: {
        // Optimize for production
        minify: 'esbuild',
        sourcemap: false,
        // Ensure assets are properly referenced
        assetsDir: 'assets',
        // Don't inject HMR code in production
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    }
})
