import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

export default defineConfig({
  plugins: [preact()],
  build: {
    lib: {
      entry: "src/index.ts",
      name: "GudDesk",
      formats: ["umd", "es"],
      fileName: (format) =>
        format === "umd" ? "guddesk.umd.cjs" : "guddesk.js",
    },
    rollupOptions: {
      // pusher-js is bundled in. widget.js runs as a classic script on
      // customer sites, where a bare import("pusher-js") cannot resolve.
      output: {
        inlineDynamicImports: true,
      },
    },
    minify: "esbuild",
    target: "es2020",
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});
