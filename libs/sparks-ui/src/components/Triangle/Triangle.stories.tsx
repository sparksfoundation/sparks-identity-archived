import type { Meta, StoryObj } from "@storybook/react";
import { Triangle as TriangleComponent } from "./Triangle";

const meta: Meta<typeof TriangleComponent> = {
  title: "Components/Triangle",
  component: TriangleComponent,
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof TriangleComponent>;

export const Triangle: Story = {
  args: {
    solid: false,
    className: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
  }
};
