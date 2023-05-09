import { useNavigate } from 'react-router-dom'
import { Main, Input, Button } from '../modules/components/elements/Primitives'
import { useIdentity } from '../modules/identity/provider'
import { PencilSquareIcon } from '@heroicons/react/20/solid'

function App() {
  const { logout, avatar, name, setAvatar, setName } = useIdentity()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate(0)
  }

  function updateAvatar(event:React.FormEvent) {
    event.preventDefault()
    const target = event.target as HTMLInputElement
    if (!target.files || !target.files.length) return
    const avatar = target.files[0]
    const reader = new FileReader()
    reader.onloadend = () => setAvatar(reader.result)
    reader.readAsDataURL(avatar)
  }

  function updateName(event:React.FormEvent) {
    event.preventDefault()
    const target = event.target as HTMLInputElement
    const name = target.value 
    setName(name)
  }

  return (
    <Main className='justify-start'>
      <div className='group relative max-h-36 mb-6'>
        <img className='relative rounded-full h-full w-full mb-10' src={avatar} alt="avatar" />
        <label className='absolute cursor-pointer bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-all'>
          <input className='opacity-0 w-5 h-5' type="file" name="avatar" onChange={updateAvatar} />
          <PencilSquareIcon className="absolute top-0 left-0 h-5 w-5 text-gray-700" />
        </label>
      </div>
      <Input className='text-center text-3xl sm:text-3xl font-bold shadow-none hover:shadow-sm ring-0 hover:ring-1 bg-transparent hover:bg-white transition-all mb-6' value={name || ''} onChange={updateName} />
      <Button onClick={handleLogout}>logout</Button>
    </Main>
  )
}

export default App
