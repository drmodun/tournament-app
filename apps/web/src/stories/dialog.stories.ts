import type { Meta, StoryObj } from "@storybook/react";
import Dialog from "components/dialog/";

const meta = {
  title: "components/dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    active: true,
    variant: "primary",
    children: "Dialog",
  },
};

export const Secondary: Story = {
  args: {
    active: true,
    variant: "secondary",
    children: "Dialog",
  },
};

export const Light: Story = {
  args: {
    active: true,
    variant: "light",
    children: "Dialog",
  },
};

export const Dark: Story = {
  args: {
    active: true,
    variant: "dark",
    children: "Dialog",
  },
};
export const Warning: Story = {
  args: {
    active: true,
    variant: "warning",
    children: "Dialog",
  },
};

export const Danger: Story = {
  args: {
    active: true,
    variant: "danger",
    children: "Dialog",
  },
};
