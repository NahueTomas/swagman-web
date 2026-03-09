import type { Meta, StoryObj } from "@storybook/react-vite";

import { ApiExplorerTaggedItem } from "./api-explorer-tagged-item";

const meta = {
  component: ApiExplorerTaggedItem,
} satisfies Meta<typeof ApiExplorerTaggedItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "getPetById",
    method: "GET",
    active: false,
    deprecated: false,
    onClick: () => alert("MOCK"),
  },
};

export const Active: Story = {
  args: {
    title: "getPetById",
    method: "GET",
    active: true,
    deprecated: false,
    onClick: () => alert("MOCK"),
  },
};

export const Deprecated: Story = {
  args: {
    title: "getPetById",
    method: "GET",
    active: false,
    deprecated: true,
    onClick: () => alert("MOCK"),
  },
};

export const ActiveDeprecated: Story = {
  args: {
    title: "getPetById",
    method: "GET",
    active: true,
    deprecated: true,
    onClick: () => alert("MOCK"),
  },
};
