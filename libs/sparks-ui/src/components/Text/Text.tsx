import React from "react";
import { clsxm } from "../../common/clsxm";
import { H1Props, H2Props, H3Props, H4Props, H5Props, H6Props, PreProps } from "react-html-props";

const tags = {
    h1: 'text-4xl sm:text-5xl font-semibold',
    h2: 'text-3xl sm:text-4xl font-semibold',
    h3: 'text-1xl sm:text-2xl font-semibold',
    h4: 'text-lg sm:text-xl font-semibold',
    h5: 'text-md sm:text-lg font-semibold',
    h6: 'text-base font-semibold',
    p: 'text-base',
    pre: 'text-base font-sans',
}

const variants = {
    default: 'text-fg-800 dark:text-fg-200',
    primary: 'text-primary-800 dark:text-primary-200',
    secondary: 'text-secondary-800 dark:text-secondary-200',
    warning: 'text-warning-800 dark:text-warning-200',
    danger: 'text-danger-800 dark:text-danger-200',
    success: 'text-success-800 dark:text-success-200',
}

export type TextProps = {
    color?: 'default' | 'primary' | 'secondary' | 'warning' | 'danger' | 'success';
} & H1Props & H2Props & H3Props & H4Props & H5Props & H6Props & H6Props & PreProps


export const H1 = ({ className = '', children, color = 'default', ...props }: TextProps) => (
    <h1 className={clsxm(tags.h1, variants[color], className)} {...props}>{children}</h1>
)

export const H2 = ({ className = '', children, color = 'default', ...props }: TextProps) => (
    <h2 className={clsxm(tags.h2, variants[color], className)} {...props}>{children}</h2>
)

export const H3 = ({ className = '', children, color = 'default', ...props }: TextProps) => (
    <h3 className={clsxm(tags.h3, variants[color], className)} {...props}>{children}</h3>
)

export const H4 = ({ className = '', children, color = 'default', ...props }: TextProps) => (
    <h4 className={clsxm(tags.h4, variants[color], className)} {...props}>{children}</h4>
)

export const H5 = ({ className = '', children, color = 'default', ...props }: TextProps) => (
    <h5 className={clsxm(tags.h5, variants[color], className)} {...props}>{children}</h5>
)

export const H6 = ({ className = '', children, color = 'default', ...props }: TextProps) => (
    <h6 className={clsxm(tags.h6, variants[color], className)} {...props}>{children}</h6>
)

export const P = ({ className = '', children, color = 'default', ...props }: TextProps) => (
    <p className={clsxm(tags.p, variants[color], className)} {...props}>{children}</p>
)

export const Pre = ({ className = '', children, color = 'default', ...props }: TextProps) => (
    <pre className={clsxm(tags.pre, variants[color], className)} {...props}>{children}</pre>
)
