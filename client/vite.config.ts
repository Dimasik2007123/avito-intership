import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const isDocker = process.env.DOCKER_ENV === "true";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/api": {
        target: isDocker ? "http://gateway:8080" : "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
