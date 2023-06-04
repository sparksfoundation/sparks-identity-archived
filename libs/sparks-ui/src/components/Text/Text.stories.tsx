import React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { H1, H2, H3, H4, H5, H6, P, Pre, TextProps } from "./Text";

type Story = StoryObj<typeof H1>;

const Text = ({ children, ...props }: TextProps) => (
    <>
        <H1 {...props}>{children}</H1>
        <H2 {...props}>{children}</H2>
        <H3 {...props}>{children}</H3>
        <H4 {...props}>{children}</H4>
        <H5 {...props}>{children}</H5>
        <H6 {...props}>{children}</H6>
        <P {...props}>{children}</P>
        <Pre {...props}>{children}</Pre>
    </>
)

const meta: Meta = {
  title: "Components/Text",
  component: Text,
  argTypes: {},
};

export default meta;


export const TextStory: Story = {
  args: {
    children: 'Text'
  },
};