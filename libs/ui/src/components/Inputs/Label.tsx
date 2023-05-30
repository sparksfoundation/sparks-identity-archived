import React from 'react'
import { clsxm } from "../../common/clsxm";
import { LabelProps } from 'react-html-props';

type LabelExtendedProps = {
    id?: string,
    children: string,
  } & LabelProps


export const Label = ({ id = '', children, ...props }: LabelExtendedProps) => (
    <label
      htmlFor={id}
      className={clsxm(
        "mb-2 text-md font-medium",
        "text-fg-700 dark:text-fg-200"
      )}
      {...props}
    >
      {children}
    </label>
  )