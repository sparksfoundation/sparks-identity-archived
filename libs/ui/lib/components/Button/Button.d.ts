/// <reference types="react" />
import { ButtonProps } from "react-html-props";
type ButtonExtendedProps = {
    size: 'sm' | 'md' | 'lg';
    color: 'primary' | 'secondary' | 'warning' | 'danger' | 'success';
    fullWidth: boolean;
    disabled: boolean;
} & ButtonProps;
export declare const Button: (props: ButtonExtendedProps) => JSX.Element;
export {};
