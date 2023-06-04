import { useTheme } from "@stores/theme"
import { Outlet } from "react-router-dom"
import { clsxm } from "sparks-ui"

const DevHeader = () => {
  return (
    <header id="dev" className="fixed z-10 top-0 left-0 w-full bg-red-900 text-xs text-slate-200 h-5 text-center">
      development version - expect breaking changes
    </header>
  )
}

export const LoadTheme = () => {
  const { theme } = useTheme(state => ({ theme: state.theme }))
  return (
    <div className={clsxm(
      !!theme && theme,
      'h-full w-full overflow-hidden',
      !theme && 'display-none',
    )}>
      <DevHeader />
      <Outlet />
    </div>
  )
}