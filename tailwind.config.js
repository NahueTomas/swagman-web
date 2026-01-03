/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/layouts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shared/styles/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 950 is your deep black, 500 is your main gray, 50 is lighter for highlights.
        background: {
          DEFAULT: "#202021", // Matches 500
          50: "#75757A",
          100: "#636367",
          200: "#525255",
          300: "#414143",
          400: "#313132",
          500: "#202021", // Base
          600: "#1A1A1B",
          700: "#141415",
          800: "#0E0E0F",
          900: "#080809",
          950: "#030303", // Deepest black
        },
        foreground: {
          DEFAULT: "#F8F8F8", // Matches 100
          50: "#FFFFFF",
          100: "#F8F8F8", // Base
          200: "#EFEFEF",
          300: "#E0E0E0",
          400: "#D1D1D1",
          500: "#B0B0B0",
          600: "#8F8F8F",
          700: "#6E6E6E",
          800: "#4D4D4D",
          900: "#2C2C2C",
          950: "#1A1A1A",
        },
        divider: { DEFAULT: "#343435" },

        // PRIMARY: Gold/Tan
        primary: {
          DEFAULT: "#BE976E", // Matches 500
          50: "#F9F5F0",
          100: "#F2EBE0",
          200: "#E5D6C1",
          300: "#D7C2A1",
          400: "#CAAD82",
          500: "#BE976E", // Base
          600: "#A67F55",
          700: "#866644",
          800: "#664D33",
          900: "#463523",
          950: "#261C13",
        },
        // SECONDARY: Royal Purple
        secondary: {
          DEFAULT: "#7850B8", // Added Default alias for convenience
          50: "#F4F0FB",
          100: "#EAE2F7",
          200: "#D5C5EF",
          300: "#C0A8E7",
          400: "#AB8BDE",
          500: "#7850B8", // Base
          600: "#604093",
          700: "#48306E",
          800: "#30204A",
          900: "#181025",
          950: "#0C0812",
        },
        // DANGER: Wine/Ruby (Matches your #8F264E vibe)
        danger: {
          DEFAULT: "#8F264E",
          50: "#FBF5F7",
          100: "#F7EAEE",
          200: "#ECD6DE",
          300: "#E0C1CD",
          400: "#D5ADBD",
          500: "#8F264E", // Base
          600: "#721E3E",
          700: "#56172F",
          800: "#390F1F",
          900: "#1D0810",
          950: "#0E0408",
        },
        // WARNING: Mustard/Amber
        warning: {
          DEFAULT: "#D79919",
          50: "#FDF9F3",
          100: "#FBF4E8",
          200: "#F6E8D0",
          300: "#F1DDB9",
          400: "#ECD1A1",
          500: "#D79919", // Base
          600: "#AC7A14",
          700: "#815C0F",
          800: "#563D0A",
          900: "#2B1F05",
          950: "#150F02",
        },
        // SUCCESS: Emerald Green
        success: {
          DEFAULT: "#15A654",
          50: "#F3FBF6",
          100: "#E8F7ED",
          200: "#D0EFDB",
          300: "#B9E7CA",
          400: "#A1DFB8",
          500: "#15A654", // Base
          600: "#118543",
          700: "#0D6432",
          800: "#084222",
          900: "#042111",
          950: "#021008",
        },
        // CALM: Steel Blue
        calm: {
          DEFAULT: "#4478B4",
          50: "#F6F9FC",
          100: "#EDF2F9",
          200: "#DBE6F2",
          300: "#C9D9EC",
          400: "#B7CCE5",
          500: "#4478B4", // Base
          600: "#366090",
          700: "#29486C",
          800: "#1B3048",
          900: "#0E1824",
          950: "#070C12",
        },
        // ALT: Amethyst/Lavender
        alt: {
          DEFAULT: "#9D71C8",
          50: "#FAF8FC",
          100: "#F5F1FA",
          200: "#EBE2F5",
          300: "#E1D4EF",
          400: "#D7C5EA",
          500: "#9D71C8", // Base
          600: "#7E5AA0",
          700: "#5E4478",
          800: "#3F2D50",
          900: "#1F1728",
          950: "#100B14",
        },
      },
      fontSize: {
        xxs: ["0.625rem", { lineHeight: "0.875rem" }],
      },
    },
  },
  plugins: [],
};