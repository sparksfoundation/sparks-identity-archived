import React from 'react'
import { clsxm } from "../../common/clsxm";
import { LabelProps } from 'react-html-props';

type LabelExtendedProps = {
    id?: string,
    children: string,
    className?: string,
  } & LabelProps


export const Label = ({ id = '', children, className = '', ...props }: LabelExtendedProps) => (
    <label
      htmlFor={id}
      className={clsxm(
        "w-full mb-2 text-md font-medium",
        "text-fg-700 dark:text-fg-200",
        className,
      )}
      {...props}
    >
      {children}
    </label>
  )