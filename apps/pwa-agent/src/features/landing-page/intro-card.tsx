import { H3, P } from "@components/elements";
import { Card, CardProps } from "@components/elements/card";
import { CheckIcon } from "@heroicons/react/20/solid";
import { clsxm } from "@libraries/clsxm";
import { ReactNode } from "react";

export type IntroCardProps = CardProps & {
  footer?: ReactNode,
  title: string,
  description: string,
  items: string[],
  highlighted?: boolean,
}

export const IntroCard = ({ className = '', footer, title, description, items, highlighted = false }: IntroCardProps) => (
  <Card className={clsxm("w-64", className)}>
    <H3 className={clsxm('text-center', highlighted && 'text-sparks-purple-600 dark:text-sparks-purple-600')}>{title}</H3>
    <P className="mt-2 mb-6 text-center">
      {description}
    </P>
    <ul role="list" className={clsxm("space-y-3 leading-6 text-inherit", footer && 'mb-8')}>
      {items.map ((item, index) => (
          <li key={index} className="flex gap-x-3 text-inherit items-center">
            <CheckIcon className={clsxm("h-5 w-5 flex-none text-current", highlighted && 'text-sparks-purple-600')} aria-hidden="true" />
            <P>{item}</P>
          </li>
        ))}
    </ul>
    {footer ? footer : <></>}
  </Card>
)
