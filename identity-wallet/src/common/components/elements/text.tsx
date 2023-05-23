import { clsxm } from "@libraries/clsxm";
import { H1Props, H2Props, H3Props, H4Props, H5Props, H6Props, PreProps } from "react-html-props";

const tags = {
  h1: 'text-4xl sm:text-5xl font-semibold',
  h2: 'text-3xl sm:text-4xl font-semibold',
  h3: 'text-1xl sm:text-2xl font-semibold',
  h4: 'text-lg sm:text-xl font-semibold',
  h5: 'text-md sm:text-lg font-semibold',
  h6: 'text-base font-semibold',
  p: 'text-base',
  pre: 'text-base',
}

const variants = {
  primary: 'text-slate-800 dark:text-slate-200',
  secondary: 'text-sparks-purple-600 dark:text-sparks-purple-500',
}

type VariantProps = {
  primary?: boolean,
  secondary?: boolean,
}

const getClasses = (tagClasses: string, className: string, props: object) => {
  const variantKey = Object.keys(props).find((key) => variants[key as keyof typeof variants]) || 'primary'
  const variant = variants[variantKey as keyof typeof variants]
  return clsxm(
    tagClasses,
    variant,
    className)
}

export const H1 = ({ className = '', children, primary, secondary, ...props }: H1Props & VariantProps) => (
  <h1 className={getClasses(tags.h1, className, props)} {...props}>{children}</h1>
)

export const H2 = ({ className = '', children, primary, secondary, ...props }: H2Props & VariantProps) => (
  <h2 className={getClasses(tags.h2, className, props)} {...props}>{children}</h2>
)

export const H3 = ({ className = '', children, primary, secondary, ...props }: H3Props & VariantProps) => (
  <h3 className={getClasses(tags.h3, className, props)} {...props}>{children}</h3>
)

export const H4 = ({ className = '', children, primary, secondary, ...props }: H4Props & VariantProps) => (
  <h4 className={getClasses(tags.h4, className, props)} {...props}>{children}</h4>
)

export const H5 = ({ className = '', children, primary, secondary, ...props }: H5Props & VariantProps) => (
  <h5 className={getClasses(tags.h5, className, props)} {...props}>{children}</h5>
)

export const H6 = ({ className = '', children, primary, secondary, ...props }: H6Props & VariantProps) => (
  <h6 className={getClasses(tags.h6, className, props)} {...props}>{children}</h6>
)

export const P = ({ className = '', children, primary, secondary, ...props }: H6Props & VariantProps) => (
  <p className={getClasses(tags.p, className, props)} {...props}>{children}</p>
)

export const Pre = ({ className = '', children, primary, secondary, ...props }: PreProps & VariantProps) => (
  <pre className={getClasses(tags.pre, className, props)} {...props}>{children}</pre>
)
