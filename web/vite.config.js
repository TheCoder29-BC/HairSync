import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/functions': {
        target: 'http://localhost:54321',   // das ist die URL, die `supabase start` ausgibt als "API URL"
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
