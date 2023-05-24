import { clsxm } from "@libraries/clsxm"
import { DivProps } from "react-html-props"

export type CardProps = DivProps 

export const Card = ({ children, className = '' }: DivProps) => {
  const base = 'overflow-hidden p-6 backdrop-blur-2xs shadow-xl border rounded-lg'
  const light = 'bg-white bg-opacity-20 border-slate-50 border-opacity-60 shadow-slate-950/4'
  const dark = 'dark:bg-slate-50 dark:bg-opacity-2 dark:border-slate-200 dark:border-opacity-10 dark:shadow-slate-950/40'
  return (
    <div className={clsxm(base, light, dark, className)}>
      {children}
    </div>
  )
}