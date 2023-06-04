import type { Meta, StoryObj } from "@storybook/react";
import { Card as CardComponent } from "./Card";

const meta: Meta<typeof CardComponent> = {
  title: "Components/Card",
  component: CardComponent,
};

export default meta;

type Story = StoryObj<typeof CardComponent>;
export const Card: Story = {};