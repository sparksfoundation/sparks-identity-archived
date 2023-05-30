import { ReactNode } from "react";
import { DivProps } from "react-html-props";
export type CardProps = {
    children: ReactNode;
    shade: 'light' | 'medium' | 'dark';
} & DivProps;
export declare const Card: ({ shade, children, ...props }: CardProps) => JSX.Element;
