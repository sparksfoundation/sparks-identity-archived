import React from "react"
import { clsxm } from "../../common/clsxm"
import { ButtonProps } from "react-html-props"

type ButtonExtendedProps = {
  size: 'sm' | 'md' | 'lg' ;
  color: 'primary' | 'secondary' | 'warning' | 'danger' | 'success';
  fullWidth: boolean;
  disabled: boolean;
} & ButtonProps

export const Button = (props: ButtonExtendedProps) => {
  const {
    children,
    size = 'md',
    color = 'primary',
    disabled = false,
    fullWidth = false,
    className, 
    ...rest 
  } = props

  return (
    <button
      className={clsxm(
        'text-slate-200',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        'rounded cursor-pointer',
        size === 'sm' && 'px-2 py-1 text-sm',
        size === 'md' && 'px-2.5 py-1.5 text-base',
        size === 'lg' && 'px-4 py-3 text-base',
        color === 'primary' && `bg-primary-600 hover:bg-primary-500 focus-visible:outline-primary-600`,
        color === 'secondary' && `bg-secondary-600 hover:bg-secondary-500 focus-visible:outline-secondary-600`,
        color === 'warning' && `bg-warning-600 hover:bg-warning-500 focus-visible:outline-warning-600`,
        color === 'danger' && `bg-danger-600 hover:bg-danger-500 focus-visible:outline-danger-600`,
        color === 'success' && `bg-success-600 hover:bg-success-500 focus-visible:outline-success-600`,
        fullWidth && 'w-full',
        disabled && 'bg-disabled-400 hover:bg-disabled-400 cursor-default',
      )}
      {...rest}
    >
      {children}
    </button>
  )
}