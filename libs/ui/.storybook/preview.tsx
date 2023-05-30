import type { Preview } from "@storybook/react";
// @ts-ignore
import React from 'react';
import { withThemeByDataAttribute } from '@storybook/addon-styling';
import { NoiseBackground } from '../src/components/NoiseBackground/index'
import "@fontsource/inter";
import "./tailwind.css";

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <div>
        <NoiseBackground />
        <div className="h-full w-full absolute top-0 left-0" style={{ padding: '20px' }}>
          <Story />
        </div>
      </div>
    ),
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-mode',
    })
  ]
};

export default preview;
