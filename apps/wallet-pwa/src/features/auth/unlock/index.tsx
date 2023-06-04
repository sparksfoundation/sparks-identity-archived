import { DivProps } from "react-html-props";
import { Member, useMembers } from "@stores/members";
import { Button, Card, H3, P, clsxm } from "sparks-ui"
import { Buffer } from "buffer";
import { Identity } from "@features/identity";
import { useState } from "react";
import { UnlockForm } from "./unlock-form";
import { useUser } from "@stores/user";

type onSubmitTypes = {
  identity?: string | undefined;
  password?: string | undefined;
}

export const UnlockIdentity = ({ className = '' }: DivProps) => {
  const { members } = useMembers(state => ({ members: state.members }))
  const [error, setError] = useState<string | undefined>(undefined)
  const [unlocking, setUnlocking] = useState<Member | undefined>()
  const { login } = useUser(state => ({ login: state.login }))

  async function onSubmit(args: onSubmitTypes) {
    try {
    const { identity, password } = args
    if (!identity || !password) throw new Error('missing data or password')
    const user = new Identity()
    await user.import({ identity, password })
    return login(user)
    } catch(e: any) {
      setError(e.message)
    }
  }

  return (
    <div className={clsxm("max-w-64", className)}>
      {!unlocking && (
        <Card>
          <H3 className={clsxm('mb-2 text-center')}>
            Unlock Identity
          </H3>
          <P className="mt-2 mb-2 text-left">
            Choose an identity to unlock. You will be prompted for your master password you used to create the identity.
          </P>
          {members.map((member) => (
            <div key={`unlock-member-${member.nonce}`}>
              <Button onClick={() => setUnlocking(member)} className="my-2" fullWidth>
                {Buffer.from(member.name, 'base64').toString('utf-8')}
              </Button>
            </div>
          ))}
        </Card>
      )}
      {unlocking && (
        <UnlockForm
          error={error}
          onSubmit={onSubmit}
          identity={unlocking}
        />
      )}
    </div>
  )
}