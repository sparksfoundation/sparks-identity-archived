import { NoiseBackground } from "ui";
import { MainProps } from "react-html-props";

export const Main = ({ children }: MainProps) => {
  return (
    <main className="dark:text-slate-100 text-slate-950 h-full">
      <NoiseBackground />
      <div className="relative h-full w-full overflow-hidden">
        {children}
      </div>
    </main>
  )
}
