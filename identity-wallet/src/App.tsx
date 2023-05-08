import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import IdentityProvider from './modules/identity/provider'
import Privelege from './modules/routing/Privelege'
import Welcome from './pages/Welcome'
import Unlock from './pages/Unlock'
import Create from './pages/Create'
import Profile from './pages/Profile'

function Routing() {
  const location = useLocation()
  const redirects = {
    welcome: location?.state?.from || '/',
    profile: location?.state?.from || '/profile',
    unlock: location?.state?.from || '/unlock-account',
  }

  return (
    <Routes>
      <Route element={<Privelege element={Welcome} registeredTo={redirects.unlock} authenticatedTo={redirects.profile} />} path="/" />
      <Route element={<Privelege element={Create} registeredTo={redirects.unlock} authenticatedTo={redirects.profile} />} path="/create-account" />
      <Route element={<Privelege element={Unlock} guestTo={redirects.welcome} authenticatedTo={redirects.profile} />} path="/unlock-account" />
      <Route element={<Privelege element={Profile} registeredTo={redirects.unlock} guestTo={redirects.welcome} />} path="/profile" />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <IdentityProvider>
        <Routing />
      </IdentityProvider>
    </BrowserRouter>
  )
}
