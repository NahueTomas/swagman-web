import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isEmbedMode = mode === "embed";

  if (isEmbedMode) {
    // Special configuration for generating embeddable files
    return {
      plugins: [react(), tsconfigPaths()],

      // ADD THIS BLOCK:
      define: {
        "process.env.NODE_ENV": '"production"',
        "process.env": "{}",
        global: "globalThis",
      },

      build: {
        target: "es2020",
        minify: "esbuild",

        lib: {
          entry: "src/main.tsx", // Use main.tsx for embed mode
          name: "SwagmanWeb", // Global name in window.SwagmanWeb
          formats: ["iife"], // Generates ONE .js file that is loaded with <script>
          fileName: "swagman-embed", // Generated file name
        },

        rollupOptions: {
          external: [], // Don't externalize anything = everything included in the final file
          output: {
            globals: {},
            assetFileNames: "swagman-embed.[ext]", // Predictable name for CSS
            exports: "named", // Disable warning about named/default exports
          },
        },
      },
    };
  }

  return {
    plugins: [react(), tsconfigPaths()],

    optimizeDeps: {
      include: [
        "@monaco-editor/react",
        "monaco-editor",
        "react",
        "react-dom",
        "react-router-dom",
        "zustand",
        "framer-motion",
        "marked",
        "swagger-client",
        "openapi-sampler",
        "immer",
      ],
      exclude: [],
    },

    server: {
      hmr: {
        overlay: false,
      },
    },

    build: {
      target: "es2020",
      minify: "esbuild",
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            "react-vendor": ["react", "react-dom", "react-router-dom"],
            "ui-vendor": [],
            "editor-vendor": ["@monaco-editor/react", "monaco-editor"],
            "api-vendor": ["swagger-client", "openapi-sampler"],
            "utils-vendor": [
              "zustand",
              "immer",
              "framer-motion",
              "marked",
              "clsx",
              "tailwind-variants",
            ],
          },
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId
                  .split("/")
                  .pop()
                  ?.replace(".ts", "")
                  .replace(".tsx", "")
              : "chunk";

            return `js/${facadeModuleId}-[hash].js`;
          },
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith(".css")) {
              return "css/[name]-[hash][extname]";
            }

            return "assets/[name]-[hash][extname]";
          },
        },
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
        external: () => {
          return false;
        },
      },
      sourcemap: process.env.NODE_ENV === "development" ? true : false,
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
    },

    css: {
      devSourcemap: true,
    },

    preview: {
      port: 3000,
      host: true,
    },
  };
});
