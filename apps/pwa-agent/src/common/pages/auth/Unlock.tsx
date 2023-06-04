import { UnlockIdentity } from "@features/auth/unlock"

export const Unlock = () => {
  return (
      <div className="relative flex flex-col justify-center items-center h-full p-6 max-w-lg mx-auto">
        <UnlockIdentity />
      </div>
  )
}
