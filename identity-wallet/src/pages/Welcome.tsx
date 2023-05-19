import { Main, H1, Logo, Button, P } from '../modules/components/elements/Primitives'

function App() {
  return (
    <Main className='flex flex-col items-center'>
      <Logo className='mb-4' height={100} width={100} />
      <H1 className='mb-6'>SPARKS ID</H1>
      <P className='text-justify mb-6'>
        Creating a SPARKS Identity allows you to store and control digital
        information about yourself, unlocking value without giving up your
        privacy. Your identity is your right and creating one is entirely
        free. Take control of your digital self today and click below to
        get started.
      </P>
      <Button href='create-account'>get started</Button>
    </Main>
  )
}

export default App
