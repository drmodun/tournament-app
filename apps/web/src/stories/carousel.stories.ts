import type { Meta, StoryObj } from "@storybook/react";
import Carousel from "components/carousel/";

const meta = {
  title: "components/carousel",
  component: Carousel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    data: [
      {
        image:
          "https://prairieblossomnursery.com/cdn/shop/products/Hibiscusfiesta_6b1a41c4-9fdd-42e5-95bf-1fd610fe0c9c_1200x1200.png?v=1671389287",
        description:
          "The hibiscus flower  is a genus of flowering plants in the mallow family, Malvaceae.",
        title: "Hibiscus flower 1",
      },
      {
        image:
          "https://www.dispatch.com/gcdn/-mm-/2887f5d7d58a75a6437c45e987fd994202334aff/c=0-156-3000-1844/local/-/media/Visalia/2014/07/30/vtd0731mastergarderner2.jpg?width=3000&height=1688&fit=crop&format=pjpg&auto=webp",
        description:
          "The hibiscus flower  is a genus of flowering plants in the mallow family, Malvaceae.",
        title: "Hibiscus flower 2",
      },
    ],
  },
} satisfies Meta<typeof Carousel>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    variant: "primary",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
  },
};

export const Light: Story = {
  args: {
    variant: "light",
  },
};

export const Dark: Story = {
  args: {
    variant: "dark",
  },
};

export const Warning: Story = {
  args: {
    variant: "warning",
  },
};

export const Danger: Story = {
  args: {
    variant: "danger",
  },
};
