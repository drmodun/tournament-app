import type { Meta, StoryObj } from "@storybook/react";
import MultilineInput from "components/multilineInput/";

const meta = {
  title: "components/multilineInput",
  component: MultilineInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof MultilineInput>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    label: "Input",
    placeholder: "Input",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    label: "Input",
    placeholder: "Input",
    variant: "secondary",
  },
};

export const Light: Story = {
  args: {
    label: "Input",
    placeholder: "Input",
    variant: "light",
  },
};

export const Dark: Story = {
  args: {
    label: "Input",
    placeholder: "Input",
    variant: "dark",
  },
};
export const Warning: Story = {
  args: {
    label: "Input",
    placeholder: "Input",
    variant: "warning",
  },
};

export const Danger: Story = {
  args: {
    label: "Input",
    placeholder: "Input",
    variant: "danger",
  },
};
