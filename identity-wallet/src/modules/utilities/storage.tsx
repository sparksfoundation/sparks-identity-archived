import localforage from 'localforage'
export const storage = localforage.createInstance({ name: 'sparks.dev.0' })
localforage.dropInstance({ name: "SPARKS" })