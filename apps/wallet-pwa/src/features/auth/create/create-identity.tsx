import { clsxm } from "sparks-ui";
import { DivProps } from "react-html-props";
import { SetName } from "./set-name";
import { useEffect, useState } from "react";
import { SetPassword } from "./set-password";
import { ConfirmPassword } from "./confirm-password";
import { Identity } from "@features/identity";
import { useMembers } from "@stores/members";
import { Buffer } from "buffer";
import { useNavigate } from "react-router-dom";

type onSubmitTypes = {
  name?: string | undefined;
  password?: string | undefined;
  confirm?: string | undefined;
}

export const CreateIdentity = ({ className = '' }: DivProps) => {
  const navigate = useNavigate()
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const { addMember } = useMembers(state => ({ addMember: state.addMember }))

  function onSubmit(key: string, data: onSubmitTypes) {
    if (key === 'name') setName(data.name || '')
    if (key === 'password') setPassword(data.password || '')
    if (key === 'confirm') {
      const passwordMatch = data.confirm === password;
      if (passwordMatch) setConfirmed(passwordMatch)
      if (!passwordMatch) setError('passwords do not match')
    }
  }

  async function createUser({ name, password }: { name: string, password: string }) {
    const identity = new Identity()
    await identity.create({ name, password })
    const b64Name = Buffer.from(name).toString('base64')
    const b64Nonce = identity.nonce
    const b64Data = identity.export()
    if (!b64Nonce || !b64Data || !b64Name) throw new Error('failed to create identity')
    addMember({ name: b64Name, nonce: b64Nonce, data: b64Data })
    navigate('/auth/unlock')
  }

  useEffect(() => {
    if (!confirmed) return;
    createUser({ name, password })
  }, [confirmed])

  const showSetName = name === '';
  const showSetPassword = name !== '' && password === '';
  const showConfirmPassword = (name !== '' && password !== '') && !confirmed;

  return (
    <div className={clsxm("max-w-64", className)}>
      <SetName
        onSubmit={data => onSubmit('name', data as onSubmitTypes)}
        className={clsxm('hidden', showSetName && 'block')}
      />
      <SetPassword
        onSubmit={data => onSubmit('password', data as onSubmitTypes)}
        className={clsxm('hidden', showSetPassword && 'block')}
      />
      <ConfirmPassword
        error={error}
        onSubmit={data => onSubmit('confirm', data as onSubmitTypes)}
        className={clsxm('hidden', showConfirmPassword && 'block')}
      />
    </div>
  )
}