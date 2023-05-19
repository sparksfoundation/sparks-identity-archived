import { useEffect, useState } from "react"
import { useIdentity } from "../identity/provider"
import { storage } from "../utilities/storage"
import { Navigate } from "react-router-dom"
import { Buffer } from "buffer"

async function getStoredIdentity():Promise<object|null> {
  return new Promise((resolve) => {
    storage.iterate((value: String, key: String) => {
      const nonce = key
      const [ b64Name ] = value.split(' ')
      const name = Buffer.from(b64Name, 'base64').toString()
      return { nonce, name, data: value }
    }).then(result => {
      resolve(result || null)
    })
    .catch(() => {
      resolve(null)
    })
  })
}

interface PrivelegeProps {
  element: React.FunctionComponent;
  guestTo?: string;
  registeredTo?: string;
  authenticatedTo?: string;
}

export default function Privelege({ element: Element, guestTo, registeredTo, authenticatedTo, ...props }: PrivelegeProps) {
  const { publicKeys } = useIdentity()
  const [ stored, setStored ] = useState<object|undefined|null>(undefined)
  const isGuest = !publicKeys && !stored
  const isRegistered = !publicKeys && !!stored
  const isAuthenticated = !!publicKeys

  useEffect(() => {
    if (stored !== undefined) return
    getStoredIdentity()
      .then(setStored)
  }, [ stored ])

  if (stored === undefined) {
    return <></>
  }

  let redirect
  if (isGuest && guestTo) redirect = guestTo
  if (isRegistered && registeredTo) redirect = registeredTo
  if (isAuthenticated && authenticatedTo) redirect = authenticatedTo

  if (redirect) {
    return <Navigate to={redirect} />
  }

  // @ts-ignore
  return <Element {... { registered: stored, ...props }} />
}
