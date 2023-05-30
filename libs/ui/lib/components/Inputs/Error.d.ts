/// <reference types="react" />
import { DivProps } from "react-html-props";
type ErrorExtendedProps = {
    children: string;
} & DivProps;
export declare const Error: ({ children, ...props }: ErrorExtendedProps) => JSX.Element;
export {};
