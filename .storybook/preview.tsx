import type { Preview } from "@storybook/react-vite";

import "../src/shared/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        "main-dark": { name: "main-dark", value: "#202021" },
        "sidebar-dark": { name: "sidebar-dark", value: "#141415" },
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: "main-dark" },
  },
};

export default preview;
