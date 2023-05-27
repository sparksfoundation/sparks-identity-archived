import { StorageSuspense } from "@providers";
import { AppRoutes } from "@routes";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <>
      <header id="dev" className="hidden fixed z-10 top-0 left-0 w-full bg-red-900 text-xs text-slate-200 h-5 text-center">development version - expect breaking changes</header>
      <StorageSuspense>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </StorageSuspense>
    </>
  )
}

export default App
