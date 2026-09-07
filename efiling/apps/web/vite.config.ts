import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // ส่งต่อคำขอไปยังส่วนให้บริการข้อมูล เพื่อไม่ต้องตั้งค่า CORS ตอนพัฒนา
      '/api': { target: 'http://localhost:4000', changeOrigin: true, rewrite: (p) => p.replace(/^\/api/, '') },
    },
  },
});
