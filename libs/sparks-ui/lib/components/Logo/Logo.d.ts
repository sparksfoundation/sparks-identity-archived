/// <reference types="react" />
import { SVGProps } from "react-html-props";
export type SVGExtendedProps = {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    mode?: 'dark' | 'light';
} & SVGProps;
export declare const Logo: ({ size, mode, className }: SVGExtendedProps) => JSX.Element;
