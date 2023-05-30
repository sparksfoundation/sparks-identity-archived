import React from "react";
import { clsxm } from "../../common/clsxm";
import { DivProps } from "react-html-props";

type ErrorExtendedProps = {
    children: string,
  } & DivProps

export const Error = ({ children, ...props }: ErrorExtendedProps) => (
    <div
        className={clsxm(
            "text-red-700 font-bold text-xs block mt-2",
            children ? "visible" : "invisible"
        )}
    >
        {children}
    </div>
)
