import { useMembers } from "@stores/members";
import { useTheme } from "@stores/theme";
import { ReactNode, useEffect, useState } from "react";

export const StorageSuspense = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme((state) => ({ theme: state.theme, }))
  const [waitFor, setWaitFor] = useState([
    'theme',
    'members',
  ])

  const unsubTheme = useTheme.persist.onFinishHydration(() => {
    setWaitFor(waitFor.filter((r) => r !== 'theme'))
  })

  const unsubMembers = useMembers.persist.onFinishHydration(() => {
    setWaitFor(waitFor.filter((r) => r !== 'members'))
  })

  useEffect(() => {
    if (!waitFor.find((r) => r === 'theme')) unsubTheme()
    if (!waitFor.find((r) => r === 'members')) unsubMembers()
    if (!waitFor.length) {
      document.body.classList.remove('loading', 'dark', 'light')
      document.body.classList.add(theme)
    }
  }, [ waitFor, theme ])

  const loaded = waitFor.length === 0

  return (
    <>
      {loaded ? children : <></>}
    </>
  )
}
