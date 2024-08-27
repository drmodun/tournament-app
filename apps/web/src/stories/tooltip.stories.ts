import type { Meta, StoryObj } from "@storybook/react";
import Tooltip from "components/tooltip/";

const meta = {
  title: "components/tooltip",
  component: Tooltip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    variant: "primary",
    message: "Tooltip",
    children: "Hover me",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    message: "Tooltip",
    children: "Hover me",
  },
};
export const Light: Story = {
  args: {
    variant: "light",
    message: "Tooltip",
    children: "Hover me",
  },
};
export const Dark: Story = {
  args: {
    variant: "dark",
    message: "Tooltip",
    children: "Hover me",
  },
};
export const Warning: Story = {
  args: {
    variant: "warning",
    message: "Tooltip",
    children: "Hover me",
  },
};
export const Danger: Story = {
  args: {
    variant: "danger",
    message: "Button",
    children: "Hover me",
  },
};
