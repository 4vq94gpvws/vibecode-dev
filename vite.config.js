import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  // React Native Web — alias zodat `import { View } from 'react-native'` werkt in Vite
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
  },
  // Optimaliseer react-native-web voor snellere dev server start
  optimizeDeps: {
    include: ['react-native-web'],
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // Allow all hosts (traffic comes via nginx reverse proxy)
    allowedHosts: true,
    // HMR WebSocket werkt niet door Synology reverse proxy (geen WS upgrade op port 3001)
    // overlay=false: red error screen disabled — errors shown via /errors SSE in portal
    hmr: { overlay: false },
    watch: {
      usePolling: true,   // Required in Docker (inotify doesn't work)
      interval: 100,
    },
  },
});
