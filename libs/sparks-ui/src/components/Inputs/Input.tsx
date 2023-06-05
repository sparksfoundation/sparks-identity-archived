import React from "react";
import { clsxm } from "../../common/clsxm"
import { UseFormRegisterReturn } from "react-hook-form";
import { InputProps } from "react-html-props";

type InputExtendedProps = {
  type?: 'text' | 'email' | 'password' | 'hidden';
  placeholder?: string,
  registration?: Partial<UseFormRegisterReturn>;
  fullWidth?: boolean;
  pattern?: string;
  disabled?: boolean;
  className?: string;
} & InputProps

export const Input = (props: InputExtendedProps) => {
  const { type = 'text', registration, className = '' } = props;
  return (
      <input
        type={type}
        className={clsxm(
          "w-full m-0 block rounded px-2.5 py-1.5 text-md shadow-none bg-bg-50",
          "text-fg-800 placeholder:text-fg-300",
          "ring-0 focus:ring-0 outline-none focus:outline-none border-0",
          "ring-1 ring-fg-300 focus:ring-primary-500 focus:ring-2",
          "invalid:ring-red-700 invalid:focus:ring-red-700",
          "disabled:ring-fg-300 disabled:focus:ring-fg-300 disabled:ring-1",
          "disabled:bg-bg-100 disabled:cursor-default",
          className,
        )}
        {...registration}
        {...props}
      />
  )
};