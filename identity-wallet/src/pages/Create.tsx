import { SubmitHandler, useForm } from 'react-hook-form';
import { Main, H1, Logo, Button, P, Label, Input, InputError } from '../modules/components/elements/Primitives'
import { useIdentity } from '../modules/identity/provider'
import { useNavigate } from 'react-router-dom';

type Inputs = {
  name: String,
  password: String,
};

function Create() {
  const { register, handleSubmit, formState: { errors } } = useForm<Inputs>();
  const { create } = useIdentity();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<Inputs> = async data => {
    const password = data.password
    const name = data.name
    await create({ name, password })
    navigate('/profile')
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
        <Input className='mb-1' type="name" error={!!errors.name} {...register('name', { required: true })} />
        {errors.name ? <InputError>an account name is required</InputError> : ''}
        <Label className='mt-6'>Master Password (8 or more characters)</Label>
        <Input className='mb-1' type="password" error={!!errors.password} {...register('password', { required: true, minLength: 10 })} />
        {errors.password ? <InputError>invalid password: {errors.password.type} condition not met</InputError> : ''}
        <Button className='mt-6' type="submit">create account</Button>
      </form>
    </Main>
  )
}

export default Create
