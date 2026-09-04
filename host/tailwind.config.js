import preset from "design-system/tailwind.preset";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    "./src/**/*.{ts,tsx}",
    "../packages/design-system/src/**/*.{ts,tsx}",
  ],
};
