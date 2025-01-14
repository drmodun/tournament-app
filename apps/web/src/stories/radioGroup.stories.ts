import type { Meta, StoryObj } from "@storybook/react";
import RadioGroup from "components/radioGroup/";

const meta = {
  title: "components/radioGroup",
  component: RadioGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    radioButtons: [
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
    radioButtons: [
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
    radioButtons: [
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
    radioButtons: [
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
    radioButtons: [
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
    radioButtons: [
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
