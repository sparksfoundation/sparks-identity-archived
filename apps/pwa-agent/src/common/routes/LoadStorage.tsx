import { useEffect, useState } from "react"
import { Outlet } from "react-router-dom"
import { UseBoundStore } from "zustand"

export const LoadStores = ({ stores }: { stores: UseBoundStore<any>[]  }) => {
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (done) return
    (async () => {
      await Promise.all(stores.map((storage) => {
        return new Promise((resolve) => {
          storage.persist.onFinishHydration(resolve)
        })
      }))
      setDone(true)
    })()
  })
  return <>{done ? <Outlet /> : <></>}</>
}