import type { Meta, StoryObj } from "@storybook/react";
import { Error as ErrorComponent } from "./Error";

// Default metadata of the story https://storybook.js.org/docs/react/api/csf#default-export
const meta: Meta<typeof ErrorComponent> = {
    title: "Components/Error",
    component: ErrorComponent,
};

export default meta;

type Story = StoryObj<typeof ErrorComponent>;
export const Error: Story = {
    args: {
        children: 'label'
    },
};