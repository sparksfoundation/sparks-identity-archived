/// <reference types="react" />
import { ClassValue } from 'clsx';
import { ButtonProps, DivProps, InputProps, LabelProps } from 'react-html-props';
import { UseFormRegisterReturn } from 'react-hook-form';

declare const clsxm: (...classes: ClassValue[]) => string;

declare function getTheme({ defaultTheme, defaultColors }: {
    defaultTheme: any;
    defaultColors: any;
}): {
    extend: {
        fontFamily: {
            sans: any[];
        };
        colors: {
            primary: {
                [k: string]: any;
            };
            secondary: {
                [k: string]: any;
            };
            warning: {
                [k: string]: any;
            };
            danger: {
                [k: string]: any;
            };
            success: {
                [k: string]: any;
            };
            disabled: any;
            fg: any;
            bg: any;
        };
        opacity: {
            '1': string;
            '2': string;
            '4': string;
            '6': string;
            '8': string;
        };
    };
};

type ButtonExtendedProps = {
    size: 'sm' | 'md' | 'lg';
    color: 'primary' | 'secondary' | 'warning' | 'danger' | 'success';
    fullWidth: boolean;
    disabled: boolean;
} & ButtonProps;
declare const Button: (props: ButtonExtendedProps) => JSX.Element;

type NoiseBackgroundProps = {
    shade?: 'light' | 'medium' | 'dark';
} & DivProps;
declare const NoiseBackground: ({ shade }: NoiseBackgroundProps) => JSX.Element;

type ErrorExtendedProps = {
    children: string;
} & DivProps;
declare const Error: ({ children, ...props }: ErrorExtendedProps) => JSX.Element;

type InputExtendedProps = {
    type?: 'text' | 'email' | 'password' | 'hidden';
    placeholder?: string;
    registration: Partial<UseFormRegisterReturn>;
    fullWidth: boolean;
    pattern?: string;
    disabled: boolean;
} & InputProps;
declare const Input: (props: InputExtendedProps) => JSX.Element;

type LabelExtendedProps = {
    id?: string;
    children: string;
} & LabelProps;
declare const Label: ({ id, children, ...props }: LabelExtendedProps) => JSX.Element;

export { Button, Error, Input, Label, NoiseBackground, clsxm, getTheme };
