import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { dependencies } from "./package.json";

export default defineConfig({
  html: {
    favicon: "./public/favicon.ico",
  },
  server: {
    port: 3001,
  },
  dev: {
    client: {
      port: 3001,
      host: "localhost",
    },
  },
  tools: {
    rspack: {
      watchOptions: {
        poll: 1000,
        aggregateTimeout: 300,
      },
    },
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      dts: false,
      name: "users",
      exposes: {
        "./users-app": "./src/App.tsx",
      },
      remotes: {},
      shared: {
        "@mf-rsbuild-example/shared-ui": {
          singleton: true,
          requiredVersion: false,
        },
        "@tanstack/react-query": {
          singleton: true,
          requiredVersion: false,
        },
        "react-router-dom": {
          singleton: true,
          requiredVersion: false,
        },
        react: {
          requiredVersion: dependencies.react,
          singleton: true,
        },
        "react/": {},
        "react-dom": {
          requiredVersion: dependencies["react-dom"],
          singleton: true,
        },
      },
    }),
  ],
});
