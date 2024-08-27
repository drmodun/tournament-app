import type { Meta, StoryObj } from "@storybook/react";
import ProgressWheel from "components/progressWheel/";

const meta = {
  title: "components/progressWheel",
  component: ProgressWheel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof ProgressWheel>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    label: "Progress wheel",
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    label: "Progress wheel",
    variant: "secondary",
  },
};

export const Light: Story = {
  args: {
    label: "Progress wheel",
    variant: "light",
  },
};

export const Dark: Story = {
  args: {
    label: "Progress wheel",
    variant: "dark",
  },
};
export const Warning: Story = {
  args: {
    label: "Progress wheel",
    variant: "warning",
  },
};

export const Danger: Story = {
  args: {
    label: "Progress wheel",
    variant: "danger",
  },
};
