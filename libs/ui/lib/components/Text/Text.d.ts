/// <reference types="react" />
import { H1Props, H2Props, H3Props, H4Props, H5Props, H6Props, PreProps } from "react-html-props";
export type TextProps = {
    color?: 'default' | 'primary' | 'secondary' | 'warning' | 'danger' | 'success';
} & H1Props & H2Props & H3Props & H4Props & H5Props & H6Props & H6Props & PreProps;
export declare const H1: ({ className, children, color, ...props }: TextProps) => JSX.Element;
export declare const H2: ({ className, children, color, ...props }: TextProps) => JSX.Element;
export declare const H3: ({ className, children, color, ...props }: TextProps) => JSX.Element;
export declare const H4: ({ className, children, color, ...props }: TextProps) => JSX.Element;
export declare const H5: ({ className, children, color, ...props }: TextProps) => JSX.Element;
export declare const H6: ({ className, children, color, ...props }: TextProps) => JSX.Element;
export declare const P: ({ className, children, color, ...props }: TextProps) => JSX.Element;
export declare const Pre: ({ className, children, color, ...props }: TextProps) => JSX.Element;
