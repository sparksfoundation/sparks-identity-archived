import { CreateIdentity } from "@features/auth/create"

export const Create = () => {
  return (
    <div className="relative flex flex-col justify-center items-center h-full p-6 max-w-lg mx-auto">
      <CreateIdentity />
    </div>
  )
}