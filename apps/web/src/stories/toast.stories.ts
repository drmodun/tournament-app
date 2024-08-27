import type { Meta, StoryObj } from "@storybook/react";
import Toast from "components/toast/";

const meta = {
  title: "components/toast",
  component: Toast,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Success: Story = {
  args: {
    type: "success",
    message: "Toast",
    autoClose: false,
  },
};

export const Error: Story = {
  args: {
    type: "error",
    message: "Toast",
    autoClose: false,
  },
};

export const Warning: Story = {
  args: {
    type: "warning",
    message: "Toast",
    autoClose: false,
  },
};

export const Info: Story = {
  args: {
    type: "info",
    message: "Toast",
    autoClose: false,
  },
};
