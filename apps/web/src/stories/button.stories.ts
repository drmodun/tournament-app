import type { Meta, StoryObj } from "@storybook/react";
import Button from "components/button/";

const meta = {
  title: "components/button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    variant: "primary",
    label: "Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    label: "Button",
  },
};

export const Light: Story = {
  args: {
    variant: "light",
    label: "Button",
  },
};

export const Dark: Story = {
  args: {
    variant: "dark",
    label: "Button",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
    label: "Button",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
    label: "Button",
  },
};
