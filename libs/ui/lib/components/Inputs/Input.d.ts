/// <reference types="react" />
import { UseFormRegisterReturn } from "react-hook-form";
import { InputProps } from "react-html-props";
type InputExtendedProps = {
    type?: 'text' | 'email' | 'password' | 'hidden';
    placeholder?: string;
    registration?: Partial<UseFormRegisterReturn>;
    fullWidth?: boolean;
    pattern?: string;
    disabled?: boolean;
    className?: string;
} & InputProps;
export declare const Input: (props: InputExtendedProps) => JSX.Element;
export {};
