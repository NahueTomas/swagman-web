import type { Meta, StoryObj } from "@storybook/react-vite";

import { Chip } from "./chip";

import { RADIUSES, SIZES, VARIANTS } from "@/shared/constants/constants";

const meta = {
  title: "Shared/Chip",
  component: Chip,
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Label",
  },

  argTypes: {
    size: {
      control: { type: "select" },
      options: SIZES,
    },
    variant: {
      control: { type: "select" },
      options: VARIANTS,
    },
    radius: {
      control: { type: "select" },
      options: RADIUSES,
    },
  },
};

export const Danger: Story = {
  args: {
    label: "*",
    size: "md",
    variant: "danger",
    radius: "md",
  },

  argTypes: {
    size: {
      control: {
        type: "select",
      },

      options: SIZES,
    },

    variant: {
      control: {
        type: "select",
      },

      options: VARIANTS,
    },

    radius: {
      control: {
        type: "select",
      },

      options: RADIUSES,
    },
  },
};

export const GhostDanger: Story = {
  args: {
    label: "*",
    variant: "ghost-danger",
    radius: "md",
  },

  argTypes: {
    size: {
      control: {
        type: "select",
      },
      options: SIZES,
    },

    variant: {
      control: {
        type: "select",
      },
      options: VARIANTS,
    },

    radius: {
      control: { type: "select" },
      options: RADIUSES,
    },
  },
};

export const GhostWarning: Story = {
  args: {
    label: "Deprecated",
    variant: "ghost-warning",
    radius: "md",
  },

  argTypes: {
    size: {
      control: {
        type: "select",
      },

      options: SIZES,
    },

    variant: {
      control: {
        type: "select",
      },

      options: VARIANTS,
    },

    radius: {
      control: {
        type: "select",
      },

      options: RADIUSES,
    },
  },
};

export const NoBG: Story = {
  args: {
    label: "GET",
    variant: "nobg-calm",
    radius: "md",
  },

  argTypes: {
    size: {
      control: {
        type: "select",
      },

      options: SIZES,
    },

    variant: {
      control: {
        type: "select",
      },

      options: VARIANTS,
    },

    radius: {
      control: {
        type: "select",
      },

      options: RADIUSES,
    },
  },
};
