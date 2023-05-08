import { forwardRef } from "react";
import { ButtonProps, H1Props, InputProps, LabelProps, MainProps, PProps, SVGProps } from "react-html-props"
import { useNavigate } from "react-router-dom"

export function Main({ children, className = '', ...props }: MainProps) {
  return (
    <main
      className={"p-5 bg-gray-50 h-full w-full flex flex-col justify-center items-center" + className}
      {...props}
    >
      <div className="fixed top-0 left-0 w-full text-center p-2 bg-orange-800 text-white font-semibold text-xs">in active development - expect breaking changes</div>
      <div className="w-full max-w-lg h-full flex flex-col justify-center items-center">
        {children}
      </div>
    </main>
  )
}

interface SparksButtonProps extends ButtonProps {
  href?: string;
  danger?: boolean;
}

export function Button({ children, className = '', type = 'button', danger = false, href, onClick, ...props }: SparksButtonProps) {
  const navigate = useNavigate()

  let handleClick = onClick
  if (!handleClick && !!href) {
    handleClick = () => {
      navigate(href)
    }
  }

  const base = "rounded-md w-full uppercase px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 "
  const primaryClasses = "bg-violet-600 hover:bg-violet-500 focus-visible:outline-violet-600 "
  const dangerClasses = "bg-red-800 hover:bg-red-700 focus-visible:outline-red-800 " 
  const classes = base + (danger ? dangerClasses : primaryClasses) + className

  return (
    <button
      type={type}
      onClick={handleClick}
      className={classes}
      {...props}
    >
      {children}
    </button>
  )
}

export function H1({ children, className = '', ...props }: H1Props) {
  return (
    <h1
      className={"text-4xl text-gray-800 font-bold " + className}
      {...props}
    >
      {children}
    </h1>
  )
}

export function P({ children, className = '', ...props }: PProps) {
  return (
    <p
      className={"text-base text-gray-700 " + className}
      {...props}
    >
      {children}
    </p>
  )
}

export function Logo({ fill = '#1f2937', className = '', ...props }: SVGProps) {
  return (
    <svg
      viewBox="0 0 118 118"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={" " + className}
      {...props}
    >
      <path
        d="M115.154 53.5969L63.8815 2.32442C61.0413 -0.515766 56.4364 -0.515772 53.5963 2.3244L2.32373 53.5969C-0.516436 56.4371 -0.516443 61.042 2.32373 63.8822L53.5963 115.155C56.4364 117.995 61.0413 117.995 63.8815 115.155L115.154 63.8822C117.994 61.042 117.994 56.4371 115.154 53.5969Z"
        fill={fill}
        id="path2" />
    </svg>

  )
}

export function Label({ children, className = '', ...props }: LabelProps) {
  return (
    <label
      className={"block text-sm font-medium leading-6 text-gray-700 " + className}
      {...props}
    >
      {children}
    </label>
  )
}

interface SparksInputProps extends InputProps {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, SparksInputProps>(({ className = '', error, ...props }: SparksInputProps, ref) => {
  className += error ? ' ring-red-700 focus:ring-red-700' : ' ring-gray-300 focus:ring-violet-600'
  return (
    <input
      ref={ref}
      className={"block w-full rounded-md border-0 p-2.5 text-gray-700 shadow-sm placeholder:text-gray-400 sm:text-sm sm:leading-6 ring-1 ring-inset focus:ring-2 focus:ring-inset " + className}
      {...props}
    />
  )
})

export function InputError({ children, className, ...props }: PProps) {
  return (
    <p
      className={"text-xs text-red-800 font-semibold " + className}
      {...props}
    >
      {children}
    </p>
  )
}
