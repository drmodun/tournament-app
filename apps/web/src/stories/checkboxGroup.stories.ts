import type { Meta, StoryObj } from "@storybook/react";
import CheckboxGroup from "components/checkboxGroup/";

const meta = {
  title: "components/checkboxGroup",
  component: CheckboxGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof CheckboxGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    checkboxes: [
      {
        variant: "primary",
        label: "Checkbox 1",
        isSelected: true,
        disabled: false,
      },
      {
        variant: "primary",
        label: "Checkbox 2",
        isSelected: true,
        disabled: false,
      },
    ],
  },
};

export const Secondary: Story = {
  args: {
    checkboxes: [
      {
        variant: "secondary",
        label: "Checkbox 1",
        isSelected: true,
        disabled: false,
      },
      {
        variant: "secondary",
        label: "Checkbox 2",
        isSelected: true,
        disabled: false,
      },
    ],
  },
};

export const Light: Story = {
  args: {
    checkboxes: [
      {
        variant: "light",
        label: "Checkbox 1",
        isSelected: true,
        disabled: false,
      },
      {
        variant: "light",
        label: "Checkbox 2",
        isSelected: true,
        disabled: false,
      },
    ],
  },
};

export const Dark: Story = {
  args: {
    checkboxes: [
      {
        variant: "dark",
        label: "Checkbox 1",
        isSelected: true,
        disabled: false,
      },
      {
        variant: "dark",
        label: "Checkbox 2",
        isSelected: true,
        disabled: false,
      },
    ],
  },
};

export const Warning: Story = {
  args: {
    checkboxes: [
      {
        variant: "warning",
        label: "Checkbox 1",
        isSelected: true,
        disabled: false,
      },
      {
        variant: "warning",
        label: "Checkbox 2",
        isSelected: true,
        disabled: false,
      },
    ],
  },
};

export const Danger: Story = {
  args: {
    checkboxes: [
      {
        variant: "danger",
        label: "Checkbox 1",
        isSelected: true,
        disabled: false,
      },
      {
        variant: "danger",
        label: "Checkbox 2",
        isSelected: true,
        disabled: false,
      },
    ],
  },
};
