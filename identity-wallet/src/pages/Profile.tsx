import { useNavigate } from 'react-router-dom'
import { Main, Input, Button } from '../modules/components/elements/Primitives'
import { useIdentity } from '../modules/identity/provider'
import { PencilSquareIcon, ArrowPathIcon } from '@heroicons/react/20/solid'

function App() {
  const { logout, avatar, name, setAvatar, setName, publicKeys, eventLog, identifier, rotateKeys } = useIdentity()
  const { encryption: publicEncryptionKey, signing: publicSigningKey } = publicKeys as { signing?: string, encryption?: string }
  
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate(0)
  }

  function updateAvatar(event: React.FormEvent) {
    event.preventDefault()
    const target = event.target as HTMLInputElement
    if (!target.files || !target.files.length) return
    const avatar = target.files[0]
    const reader = new FileReader()
    reader.onloadend = () => setAvatar(reader.result)
    reader.readAsDataURL(avatar)
  }

  function updateName(event: React.FormEvent) {
    event.preventDefault()
    const target = event.target as HTMLInputElement
    const name = target.value
    setName(name)
  }

  return (
    <Main className='flex flex-col items-center justify-start'>
      <div className='group relative mb-6'>
        <img className='relative rounded-full w-40 h-40 object-cover' src={avatar || ''} alt="avatar" />
        <label className='absolute cursor-pointer bottom-0 right-0 opacity-0 group-hover:opacity-100 transition-all'>
          <input className='opacity-0 w-5 h-5' type="file" name="avatar" onChange={updateAvatar} />
          <PencilSquareIcon className="absolute top-0 left-0 h-5 w-5 text-gray-700" />
        </label>
      </div>
      <Input className='text-center text-3xl sm:text-3xl font-bold shadow-none hover:shadow-sm ring-0 hover:ring-1 bg-transparent hover:bg-white transition-all mb-3' value={name || ''} onChange={updateName} />

      <ArrowPathIcon onClick={() => rotateKeys()} className="h-6 w-6 inline-block ml-2 stroke-gray-700 stroke-1" />
      <h3 className='w-full text-gray-700 font-extrabold'>Incepted Identifier</h3>
      <h3 className="w-full mb-3 text-violet-950 opacity-80 font-bold overflow-hidden text-ellipsis">{identifier}</h3>
      <h3 className='w-full text-gray-700 font-extrabold'>Encryption Public Key</h3>
      <h3 className="w-full mb-3 text-violet-950 opacity-80 font-bold overflow-hidden text-ellipsis">{publicEncryptionKey}</h3>
      <h3 className='w-full text-gray-700 font-extrabold'>Signing Public Key</h3>
      <h3 className="w-full mb-3 text-violet-950 opacity-80 font-bold overflow-hidden text-ellipsis">{publicSigningKey}</h3>
      <h3 className='w-full text-gray-700 font-extrabold'>Signing Public Key</h3>
      <textarea className='w-full resize-none text-xs mt-2 mb-6 h-96 p-6 text-ellipsis whitespace-pre font-semibold text-gray-700 bg-gray-100' readOnly value={JSON.stringify(eventLog, null, 2)}></textarea>
      <Button onClick={handleLogout}>logout</Button>
    </Main>
  )
}

export default App
