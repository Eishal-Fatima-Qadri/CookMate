// vite.config.mjs
import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        open: true,
        '/api': {
            target: 'http://localhost:5000', // Your Express server port
            changeOrigin: true,
            secure: false,
        },
    },
});
