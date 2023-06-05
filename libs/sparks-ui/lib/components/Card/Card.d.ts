import { ReactNode } from "react";
import { DivProps } from "react-html-props";
export type CardProps = {
    children: ReactNode;
    shade?: 'light' | 'medium' | 'dark';
    className?: string;
} & DivProps;
export declare const Card: ({ shade, children, className, ...props }: CardProps) => JSX.Element;
