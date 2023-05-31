import type { Meta, StoryObj } from "@storybook/react";
import { Button as ButtonComponent } from "./Button";

const meta: Meta<typeof ButtonComponent> = {
  title: "Components/Button",
  component: ButtonComponent,
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof ButtonComponent>;

export const Button: Story = {
  args: {
    children: "button text",
    size: "md",
    color: "primary",
  },
};