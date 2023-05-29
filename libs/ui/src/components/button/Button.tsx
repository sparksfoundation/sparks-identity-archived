import React from "react"
import { clsxm } from "../../utils/clsxm"
import { ButtonProps } from "react-html-props"

type ButtonExtendedProps = {
  children?: React.ReactNode,
  xs?: boolean,
  sm?: boolean,
  md?: boolean,
  lg?: boolean,
  xl?: boolean,
  primary?: boolean,
  secondary?: boolean,
  success?: boolean,
  danger?: boolean,
  warning?: boolean,
  disabled?: boolean,
  full?: boolean,
} & ButtonProps

const Button = ({
  children,
  className = '',
  xs = false,
  sm = false,
  md = true,
  lg = false,
  xl = false,
  full = false,
  primary = true,
  secondary = false,
  success = false,
  danger = false,
  warning = false,
  disabled = false,
  ...props
}: ButtonExtendedProps) => (
  <button
    type="button"
    className={clsxm(
      'rounded font-semibold text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer',
      xs && 'px-2 py-1 text-xs',
      sm && 'px-2 py-1 text-sm',
      md && 'px-2.5 py-1.5 text-sm',
      lg && 'px-3 py-2 text-sm',
      xl && 'px-3.5 py-2.5 text-sm',
      full && 'w-full',
      primary && 'bg-sparks-purple-600 hover:bg-sparks-purple-500 focus-visible:outline-sparks-purple-600',
      secondary && 'bg-gray-600 hover:bg-indigo-500 focus-visible:outline-indigo-600',
      success && 'bg-green-600 hover:bg-indigo-500 focus-visible:outline-indigo-600',
      danger && 'bg-red-600 hover:bg-indigo-500 focus-visible:outline-indigo-600',
      warning && 'bg-orange-600 hover:bg-orange-500 focus-visible:outline-orange-600',
      disabled && 'bg-gray-400 hover:bg-gray-400 focus-visible:outline-gray-400',
      className,
    )}
    {...props}
  >
    {children}
  </button>
)

export default Button