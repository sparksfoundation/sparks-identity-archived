import React from "react";
import { ButtonProps } from "react-html-props";
type ButtonExtendedProps = {
    children?: React.ReactNode;
    xs?: boolean;
    sm?: boolean;
    md?: boolean;
    lg?: boolean;
    xl?: boolean;
    primary?: boolean;
    secondary?: boolean;
    success?: boolean;
    danger?: boolean;
    warning?: boolean;
    disabled?: boolean;
    full?: boolean;
} & ButtonProps;
declare const Button: ({ children, className, xs, sm, md, lg, xl, full, primary, secondary, success, danger, warning, disabled, ...props }: ButtonExtendedProps) => JSX.Element;
export default Button;
