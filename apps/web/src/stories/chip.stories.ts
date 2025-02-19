import type { Meta, StoryObj } from "@storybook/react";
import Chip from "components/chip/";

const meta = {
  title: "components/chip",
  component: Chip,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    label: "Chip",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    label: "Chip",
    variant: "secondary",
  },
};

export const Light: Story = {
  args: {
    label: "Chip",
    variant: "light",
  },
};

export const Dark: Story = {
  args: {
    label: "Chip",
    variant: "dark",
  },
};
export const Warning: Story = {
  args: {
    label: "Chip",
    variant: "warning",
  },
};

export const Danger: Story = {
  args: {
    label: "Chip",
    variant: "danger",
  },
};
