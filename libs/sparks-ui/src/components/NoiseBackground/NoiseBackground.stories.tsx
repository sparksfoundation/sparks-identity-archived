import type { Meta, StoryObj } from "@storybook/react";
import { NoiseBackground as NoiseBackgroundComponent } from "./NoiseBackground";

// Default metadata of the story https://storybook.js.org/docs/react/api/csf#default-export
const meta: Meta<typeof NoiseBackgroundComponent> = {
  title: "Components/NoiseBackground",
  component: NoiseBackgroundComponent,
  argTypes: {},
};

export default meta;

// The story type for the component https://storybook.js.org/docs/react/api/csf#named-story-exports
type Story = StoryObj<typeof NoiseBackgroundComponent>;

export const NoiseBackground: Story = {
  args: {},
};