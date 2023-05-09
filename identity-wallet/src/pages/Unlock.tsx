import { SubmitHandler, useForm } from 'react-hook-form';
import { Main, H1, Logo, Button, P, Label, Input, InputError } from '../modules/components/elements/Primitives'
import { useIdentity } from '../modules/identity/provider'
import { base64ToAscii } from '../modules/identity/utilities';
import { Navigate, useNavigate } from 'react-router-dom';
import { storage } from '../modules/utilities/storage';

type Inputs = {
  name: String,
  password: String,
};

const Unlock = (props:any) => {
  const [ baseName, nonce, identity ] = props.registered.value.split(' ')
  const name = base64ToAscii(baseName)
  const navigate = useNavigate()

  if (!name.length) {
    return <Navigate to="/" />
  }

  const { register, setError, handleSubmit, formState: { errors } } = useForm<Inputs>();
  const { login, logout } = useIdentity();

  const onSubmit: SubmitHandler<Inputs> = async (data, e) => {
    e?.preventDefault()
    const password = data.password
    login({ identity, nonce, password })
    .catch(() => {
      setError('password', { type: '', message: 'invalid password' });
    })
  }

  const deleteAccount = function () {
    if (confirm('are you sure? this can\'t be undone, you will not be able to recover your account')) {
      storage.removeItem(props.registered.key).then(() => {
        logout()
        navigate(0)
      })
    }
  }

  return (
    <Main>
      <Logo className='mb-4' height={100} width={100} />
      <H1 className='mb-6'>SPARKS ID</H1>
      <P className='text-justify mb-6'>
        To setup your SPARKS Identity, you'll need to provide name and a master
        password. The name is for you convenience and the password used to generate
        your unique identity and protect your digital information. It's important to
        choose a strong, unique password that only you know and won't forget.
      </P>
      <form className='w-full' onSubmit={handleSubmit(onSubmit)}>
        <Label>Account Name</Label>
        <Input className='mb-1' type="name" defaultValue={name} disabled={true} error={!!errors.name} {...register('name', { required: true, value: name })} />
        {errors.name ? <InputError>an account name is required</InputError> : ''}
        <Label className='mt-6'>Master Password (8 or more characters)</Label>
        <Input className='mb-1' type="password" error={!!errors.password} {...register('password', { required: true })} />
        {errors.password ? <InputError>incorrect password</InputError> : ''}
        <div className='flex mt-6'>
          <Button className='w-1/2 mr-1' danger type="button" onClick={deleteAccount}>delete</Button>
          <Button className='w-1/2 ml-1' type="submit">unlock</Button>
        </div>
      </form>
    </Main>
  )
}

export default Unlock
