import { Noise } from "@components/elements";
import { MainProps } from "react-html-props";

export const Main = ({ children }: MainProps) => {
  return (
    <main className="dark:bg-slate-950 bg-slate-200 dark:text-slate-100 text-slate-950 h-full">
      <Noise />
      <div className="relative h-full w-full overflow-hidden">
        {children}
      </div>
    </main>
  )
}
