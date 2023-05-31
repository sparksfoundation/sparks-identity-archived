import React from "react"
import { SVGProps } from "react-html-props"
import { clsxm } from "../../common/clsxm"

export type SVGExtendedProps = {
    size: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    mode?: 'dark' | 'light';
} & SVGProps

export const Logo = ({ size = 'md', mode }: SVGExtendedProps) => {
    return (
        <svg
            className={clsxm(
                'inline-block',
                size === 'xs' && 'h-5 w-5',
                size === 'sm' && 'h-10 w-10',
                size === 'md' && 'h-20 w-20',
                size === 'lg' && 'h-40 w-40',
                size === 'xl' && 'h-80 w-80',
            )}
            fill="none"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                className={clsxm(
                    "dark:fill-bg-200 fill-bg-800",
                    mode === 'light' && "dark:fill-bg-200 fill-bg-200",
                    mode === 'dark' && "dark:fill-bg-800 fill-bg-800",
                )}
                d="M80.8848 47.0283L52.6849 18.8284C51.1228 17.2663 48.5901 17.2663 47.028 18.8284L18.8281 47.0283C17.266 48.5904 17.266 51.1231 18.8281 52.6852L47.028 80.8851C48.5901 82.4472 51.1228 82.4472 52.6849 80.8851L80.8848 52.6852C82.4469 51.1231 82.4469 48.5904 80.8848 47.0283Z"
            />
        </svg>
    )
}