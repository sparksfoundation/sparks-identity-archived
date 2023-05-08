import { useNavigate } from 'react-router-dom'
import { Main, H1, Logo, P, Button } from '../modules/components/elements/Primitives'
import { useIdentity } from '../modules/identity/provider'

function App() {
  const { logout } = useIdentity()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate(0)
  }

  return (
    <Main>
      <Logo className='mb-4' height={100} width={100} />
      <H1 className='mb-6'>Profile</H1>
      <P className='text-justify mb-6'>
        Profile
      </P>
      <Button onClick={handleLogout}>logout</Button>
    </Main>
  )
}

export default App
