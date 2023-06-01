/// <reference types="react" />
import { ClassValue } from 'clsx';
import { ButtonProps, SVGProps, DivProps, InputProps, LabelProps, H1Props, H2Props, H3Props, H4Props, H5Props, H6Props, PreProps } from 'react-html-props';
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
        borderRadius: {
            '4xl': string;
        };
        maxWidth: {
            '1/4': string;
            '1/3': string;
            '5/12': string;
            '1/2': string;
            '7/12': string;
            '2/3': string;
            '3/4': string;
        };
        maxHeight: {
            '1/4': string;
            '1/3': string;
            '5/12': string;
            '1/2': string;
            '7/12': string;
            '2/3': string;
            '3/4': string;
        };
        screens: {
            '800': string;
            '500': string;
        };
        opacity: {
            '1': string;
            '2': string;
            '4': string;
            '6': string;
            '8': string;
        };
        backdropBlur: {
            '2xs': string;
            xs: string;
        };
    };
};
declare const safelist: {
    pattern: RegExp;
    variants: string[];
}[];

type ButtonExtendedProps = {
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary' | 'warning' | 'danger' | 'success';
    fullWidth?: boolean;
    disabled?: boolean;
} & ButtonProps;
declare const Button: (props: ButtonExtendedProps) => JSX.Element;

type SVGExtendedProps = {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    mode?: 'dark' | 'light';
} & SVGProps;
declare const Logo: ({ size, mode, className }: SVGExtendedProps) => JSX.Element;

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

type NoiseBackgroundProps = {
    shade?: 'light' | 'medium' | 'dark';
} & DivProps;
declare const NoiseBackground: ({ shade }: NoiseBackgroundProps) => JSX.Element;

type TextProps = {
    color?: 'default' | 'primary' | 'secondary' | 'warning' | 'danger' | 'success';
} & H1Props & H2Props & H3Props & H4Props & H5Props & H6Props & H6Props & PreProps;
declare const H1: ({ className, children, color, ...props }: TextProps) => JSX.Element;
declare const H2: ({ className, children, color, ...props }: TextProps) => JSX.Element;
declare const H3: ({ className, children, color, ...props }: TextProps) => JSX.Element;
declare const H4: ({ className, children, color, ...props }: TextProps) => JSX.Element;
declare const H5: ({ className, children, color, ...props }: TextProps) => JSX.Element;
declare const H6: ({ className, children, color, ...props }: TextProps) => JSX.Element;
declare const P: ({ className, children, color, ...props }: TextProps) => JSX.Element;
declare const Pre: ({ className, children, color, ...props }: TextProps) => JSX.Element;

type TriangleProps = {
    solid?: boolean;
} & DivProps;
declare const Triangle: ({ className, solid }: TriangleProps) => JSX.Element;

export { Button, Error, H1, H2, H3, H4, H5, H6, Input, Label, Logo, NoiseBackground, P, Pre, SVGExtendedProps, TextProps, Triangle, clsxm, getTheme, safelist };
