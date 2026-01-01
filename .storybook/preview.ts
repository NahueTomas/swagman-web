import type { Decorator, Preview } from "@storybook/react-vite";

import { withThemeByClassName } from "@storybook/addon-themes";

import "../src/shared/styles/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },
  },
};

export const decorators: Decorator[] = [
  withThemeByClassName({
    themes: {
      dark: "dark",
    },
    defaultTheme: "dark",
  }),
];

export default preview;
