import type { Meta, StoryObj } from "@storybook/react-vite";

import { ButtonSelectable } from "./button-selectable";

const meta = {
  title: "Shared/ButtonSelectable",
  component: ButtonSelectable,
} satisfies Meta<typeof ButtonSelectable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    active: false,
    onSelect: () => null,
    children: "Selectable button",
  },
};

export const Active: Story = {
  args: {
    active: true,
    onSelect: () => null,
    children: "Selectable button",
  },
};
