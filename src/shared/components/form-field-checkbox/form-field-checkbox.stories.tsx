import type { Meta, StoryObj } from "@storybook/react-vite";

import { FormFieldCheckbox } from "./form-field-checkbox";

import { SIZES } from "@/shared/constants/constants";

const meta = {
  component: FormFieldCheckbox,
} satisfies Meta<typeof FormFieldCheckbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onChange: () => {},
    required: false,
    value: true,
    id: "",
  },
  argTypes: {
    size: {
      control: {
        type: "select",
      },
      options: SIZES,
    },
  },
};
