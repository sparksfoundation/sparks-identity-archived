import { useNavigate } from "react-router-dom"
import { Card, H3, clsxm, Button, H1, P, Triangle } from 'sparks-ui'
import { ThemeSwitcher } from "@components/ThemeSwitcher"
import { CheckIcon } from "@heroicons/react/20/solid";
import { ReactNode } from "react";

type IntroCardProps = {
  footer?: ReactNode,
  title: string,
  className?: string,
  description: string,
  items: string[],
  highlighted?: boolean,
}

const IntroCard = ({ className = '', footer, title, description, items, highlighted = false }: IntroCardProps) => (
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

export const Landing = () => {
  const navigate = useNavigate()
  return (
    <>
      <ThemeSwitcher className="absolute top-4 right-4" />
      <Triangle className="left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />
      <Triangle className="left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2" />
      <div className="relative flex flex-col justify-center items-center h-full p-6 max-w-4xl mx-auto">
        <H1 className="text-center mb-2 ">SPARKS</H1>
        <P className="text-center text-xl sm:text-2xl mb-6">Get started with your SPARKS Identity</P>
        <div className="w-full flex items-center justify-center">
          <IntroCard
            className="hidden 800:block"
            title="Your Identity"
            description="Add, update and manage digital identity credentials!"
            items={['Email & Phone', 'Social Accounts', 'Web3 Accounts', 'Domains & More']}
          />
          <IntroCard
            highlighted
            className="z-10 -mx-3"
            title="Get Started Now"
            description="Getting started is easy! Click below to follow setup steps."
            items={['Name your identity', 'Provide a password', 'Add your credentials', 'Reclaim your identity!']}
            footer={<Button fullWidth onClick={() => navigate('/auth/create')}>Create</Button>}
          />
          <IntroCard
            className="hidden 800:block"
            title="Apps & Services"
            description="Access apps and services with your SPARKS Identity!"
            items={['No more sign-ups', 'Safer, smaller footprint', 'Unlocked data value', 'Better user experience']}
          />
        </div>
      </div>
    </>
  )
}
