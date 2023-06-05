import React from "react";
import { clsxm } from "../../common/clsxm";
import { DivProps } from "react-html-props";

type ErrorExtendedProps = {
    children?: string,
    className?: string,
  } & DivProps

export const Error = ({ children, className = '', ...props }: ErrorExtendedProps) => (
    <div
        className={clsxm(
            "text-red-700 font-bold text-xs block mt-2 w-full",
            children ? "visible" : "invisible",
            className,
        )}
        {...props}
    >
        {children}
    </div>
)
