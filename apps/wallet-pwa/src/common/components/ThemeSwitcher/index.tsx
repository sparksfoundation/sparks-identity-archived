import { MoonIcon, SunIcon } from "@heroicons/react/20/solid";
import { clsxm } from "sparks-ui";
import { useTheme, Themes } from "@stores/theme";

export const ThemeSwitcher = ({ className = '', fill = '' }: { className?: string, fill?: string }) => {
  const { theme, setTheme } = useTheme(state => ({ theme: state.theme, setTheme: state.setTheme }));
  const classes = clsxm(
    "cursor-pointer w-6 h-6",
    "text-slate-700 dark:text-slate-200",
  )
  const nextTheme = theme === 'dark' ? Themes.light : Themes.dark;
  return (
    <button className={clsxm("absolute top-4 right-4 z-10 p-1 cursor-pointer", className)} onClick={() => setTheme(nextTheme)}>
      <SunIcon className={clsxm(classes, fill, 'hidden dark:block')} />
      <MoonIcon className={clsxm(classes, fill, 'block dark:hidden')} />
    </button>
  )
}