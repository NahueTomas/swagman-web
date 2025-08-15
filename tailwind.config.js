import {heroui} from "@heroui/theme"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    './src/layouts/**/*.{js,ts,jsx,tsx,mdx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
    './src/shared/components/**/*.{js,ts,jsx,tsx,mdx}',
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
    'bg-primary/15',
    'bg-primary/20',
    'bg-success/10',
    'bg-warning/10',
    'bg-danger/10',
    'bg-default/10',
    'bg-secondary/10',
    'bg-default-100',
    'bg-default-50',
    'cursor-ew-resize',
    'cursor-ns-resize',
    'cursor-nwse-resize',
    'text-default-400',
    'text-default-700',
    'text-default-900',
    'text-primary-600',
    'text-primary-700',
    'border-primary/20',
    'border-primary/15',
    'border-primary/25',
    'border-transparent',
    'border-default-200',
    'hover:bg-default-100',
    'hover:bg-default-50',
    'hover:text-default-900',
    'hover:border-default-200',
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [heroui({
    themes: {
      dark: {
        colors: {
          background: "#0A0A0B",
          divider: "#FFFFFF18",
          content1: "#111113",
          content2: "#1C1C1E"
        },
      },
    },
  })],
}
