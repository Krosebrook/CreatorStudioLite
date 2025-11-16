import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Production optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supabase': ['@supabase/supabase-js'],
          'icons': ['lucide-react', '@heroicons/react'],
        },
      },
    },
    // Source maps for production debugging
    sourcemap: true,
    // Increase chunk size warning limit for enterprise features
    chunkSizeWarningLimit: 1000,
  },
  server: {
    // Development server configuration
    port: 5173,
    strictPort: false,
    host: true,
  },
  preview: {
    // Preview server configuration
    port: 4173,
    strictPort: false,
    host: true,
  },
});
