import type { Meta, StoryObj } from "@storybook/react";
import Dropdown from "components/dropdown/";

const meta = {
  title: "components/dropdown",
  component: Dropdown,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Dropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    options: [{ label: "Option 1" }, { label: "Option 2" }],
    variant: "primary",
    placeholder: "Select an option",
  },
};

export const Secondary: Story = {
  args: {
    options: [{ label: "Option 1" }, { label: "Option 2" }],
    variant: "secondary",
    placeholder: "Select an option",
  },
};

export const Light: Story = {
  args: {
    options: [{ label: "Option 1" }, { label: "Option 2" }],
    variant: "light",
    placeholder: "Select an option",
  },
};

export const Dark: Story = {
  args: {
    options: [{ label: "Option 1" }, { label: "Option 2" }],
    variant: "dark",
    placeholder: "Select an option",
  },
};

export const Warning: Story = {
  args: {
    options: [{ label: "Option 1" }, { label: "Option 2" }],
    variant: "warning",
    placeholder: "Select an option",
  },
};

export const Danger: Story = {
  args: {
    options: [{ label: "Option 1" }, { label: "Option 2" }],
    variant: "danger",
    placeholder: "Select an option",
  },
};
