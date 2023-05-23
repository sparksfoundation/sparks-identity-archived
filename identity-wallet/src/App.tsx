import { StorageSuspense } from "@providers";
import { AppRoutes } from "@routes";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <>
      <StorageSuspense>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </StorageSuspense>
    </>
  )
}

export default App
