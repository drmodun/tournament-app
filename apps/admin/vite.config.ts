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
  // The Docker image serves the build with `vite preview` behind the stack's Caddy, which forwards whatever
  // domain the site runs on; without this Vite answers 403 to every host but localhost
  preview: {
    allowedHosts: true,
  },
});
