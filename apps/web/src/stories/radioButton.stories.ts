import type { Meta, StoryObj } from "@storybook/react";
import RadioButton from "components/radioButton/";

const meta = {
  title: "components/radioButton",
  component: RadioButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: { label: "Radio button", isSelected: true, disabled: false },
} satisfies Meta<typeof RadioButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    variant: "primary",
    label: "Checkbox",
    isSelected: true,
    disabled: false,
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    label: "Checkbox",
    isSelected: true,
    disabled: false,
  },
};

export const Light: Story = {
  args: {
    variant: "light",
    label: "Checkbox",
    isSelected: true,
    disabled: false,
  },
};

export const Dark: Story = {
  args: {
    variant: "dark",
    label: "Checkbox",
    isSelected: true,
    disabled: false,
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    label: "Checkbox",
    isSelected: true,
    disabled: false,
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    label: "Button",
    isSelected: true,
    disabled: false,
  },
};
