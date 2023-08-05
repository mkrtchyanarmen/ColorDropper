import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [checker({ typescript: true }), react(), svgr({ exportAsDefault: true })],
  resolve: {
    alias: {
      '@components': resolve(__dirname, './src/components/'),
      '@utils': resolve(__dirname, './src/utils/'),
      '@hooks': resolve(__dirname, './src/hooks/'),
      '@assets': resolve(__dirname, './src/assets/'),
    },
  },
  server: {
    open: true,
    port: 3000,
  },
});
