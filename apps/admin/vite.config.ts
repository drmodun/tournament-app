import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/admin/",
  server: {
    port: 3001,
    strictPort: true,
    host: true,
  },
});
