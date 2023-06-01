import { Triangle } from "ui"
import { ThemeSwitcher } from "@components/elements/theme-switcher"
import { Main } from "@components/layout"
import { UnlockIdentity } from "@features/unlock-page"

export const Unlock = () => {
  return (
    <Main>
      <ThemeSwitcher className="absolute top-4 right-4" />
      <Triangle className="left-1/2 top-0 -translate-x-1/2 -translate-y-1/2" />
      <Triangle className="left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2" />
      <div className="relative flex flex-col justify-center items-center h-full p-6 max-w-lg mx-auto">
        <UnlockIdentity />
      </div>
    </Main>
  )
}
