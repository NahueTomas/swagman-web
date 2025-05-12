import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-primary',
    'bg-success',
    'bg-warning',
    'bg-danger',
    'bg-default',
    'bg-secondary',
    'bg-opacity-10',
    'bg-primary/10',
    'bg-success/10',
    'bg-warning/10',
    'bg-danger/10',
    'bg-default/10',
    'bg-secondary/10',
    'cursor-ew-resize',
    'cursor-ns-resize',
    'cursor-nwse-resize',
    'text-default-400',
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui()],
}
