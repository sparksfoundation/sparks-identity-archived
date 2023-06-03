import { Button } from "ui"
import { ThemeSwitcher } from "@components/ThemeSwitcher"
import { Main } from "@components/layout"

export const Import = () => {
  return (
    <Main>
      <ThemeSwitcher className="absolute top-4 right-4" />
      <Button>Import</Button>
    </Main>
  )
}
