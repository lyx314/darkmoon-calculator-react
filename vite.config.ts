import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  // 相对路径，便于部署到 GitHub Pages 的子目录
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: {
    // pnpm 的软链布局下确保全站只有一份 React，否则会触发 "Invalid hook call"
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    // 显式预构建，避免新增依赖后旧缓存导致 React 被打包成两份
    include: ["react", "react-dom", "react/jsx-runtime", "zustand"],
  },
  server: {
    watch: {
      // 只监视源码即可。编辑器/脚本在 scripts 等目录写临时文件时，
      // Windows 上会让 Vite 的 watcher 抛 EBUSY 直接把 dev server 打挂。
      ignored: [
        "**/scripts/**",
        "**/tests/**",
        "**/legacy/**",
        "**/docs/**",
        "**/*.tmp",
        "**/*.tmpdir/**",
      ],
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
  },
});
