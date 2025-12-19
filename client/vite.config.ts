import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    allowedHosts: ["sch.shtelo.org"],
  },
  optimizeDeps: {
    exclude: ["fsevents"],
  },
  ssr: {
    external: ["fsevents"],
  },
});
