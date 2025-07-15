import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "electron-vite";

export default defineConfig({
	main: {
		build: { rollupOptions: { input: "./src/main.ts" } },
	},
	preload: {
		build: { rollupOptions: { input: "./src/preload.ts" } },
	},
	renderer: {
		plugins: [react(), tailwindcss()],
	},
});
