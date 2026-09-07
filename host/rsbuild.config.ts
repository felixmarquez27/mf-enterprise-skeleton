import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { dependencies } from "./package.json";

export default defineConfig({
  server: {
    port: 3000,
  },
  dev: {
    client: {
      port: 3000,
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
  html: {
    favicon: "./public/favicon.ico",
  },
  plugins: [
    pluginReact(),
    pluginModuleFederation({
      name: "host",
      dts: false,
      remotes: {
        users: "users@http://localhost:3001/mf-manifest.json",
      },
      exposes: {},
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
        i18next: {
          singleton: true,
          requiredVersion: false,
        },
        "react-i18next": {
          singleton: true,
          requiredVersion: false,
        },
        react: {
          requiredVersion: dependencies.react,
          singleton: true,
        },
        "react-dom": {
          requiredVersion: dependencies["react-dom"],
          singleton: true,
        },
      },
    }),
  ],
});
