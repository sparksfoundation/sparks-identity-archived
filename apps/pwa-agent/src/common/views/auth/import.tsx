import { Button } from "@components/elements/buttons"
import { ThemeSwitcher } from "@components/elements/theme-switcher"
import { Main } from "@components/layout"

export const Import = () => {
  return (
    <Main>
      <ThemeSwitcher className="absolute top-4 right-4" />
      <Button>Import</Button>
    </Main>
  )
} 