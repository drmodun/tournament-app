import type { Meta, StoryObj } from "@storybook/react";
import Input from "components/input/";

const meta = {
  title: "components/input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    label: "Input",
    placeholder: "Input",
    variant: "primary",
    submitLabel: "Submit",
  },
};

export const Secondary: Story = {
  args: {
    label: "Input",
    placeholder: "Input",
    variant: "secondary",
    submitLabel: "Submit",
  },
};

export const Light: Story = {
  args: {
    label: "Input",
    placeholder: "Input",
    variant: "light",
    submitLabel: "Submit",
  },
};

export const Dark: Story = {
  args: {
    label: "Input",
    placeholder: "Input",
    variant: "dark",
    submitLabel: "Submit",
  },
};

export const Warning: Story = {
  args: {
    label: "Input",
    placeholder: "Input",
    variant: "warning",
    submitLabel: "Submit",
  },
};

export const Danger: Story = {
  args: {
    label: "Input",
    placeholder: "Input",
    variant: "danger",
    submitLabel: "Submit",
  },
};
