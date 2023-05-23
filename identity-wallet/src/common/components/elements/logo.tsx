import { clsxm } from "@libraries/clsxm"
import { SVGProps } from "react-html-props"

export const Logo = ({ className = "", fill = '' }: SVGProps) => {
  return (
    <svg className={clsxm('h-6 w-6 inline-block', className)} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path className={clsxm("dark:fill-slate-200 fill-slate-800", fill)} d="M80.8848 47.0283L52.6849 18.8284C51.1228 17.2663 48.5901 17.2663 47.028 18.8284L18.8281 47.0283C17.266 48.5904 17.266 51.1231 18.8281 52.6852L47.028 80.8851C48.5901 82.4472 51.1228 82.4472 52.6849 80.8851L80.8848 52.6852C82.4469 51.1231 82.4469 48.5904 80.8848 47.0283Z" />
    </svg>
  )
}