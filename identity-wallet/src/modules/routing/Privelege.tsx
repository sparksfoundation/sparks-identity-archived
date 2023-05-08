import { useEffect, useState } from "react"
import { useIdentity } from "../identity/provider"
import { storage } from "../utilities/storage"
import { Navigate } from "react-router-dom"

async function getStoredIdentity():Promise<object|null> {
  return new Promise((resolve) => {
    storage.iterate((value: String, key: String) => {
      return { key, value }
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
  const { publicKey } = useIdentity()
  const [ stored, setStored ] = useState<object|undefined|null>(undefined)
  const isGuest = !publicKey && !stored
  const isRegistered = !publicKey && !!stored
  const isAuthenticated = !!publicKey

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
