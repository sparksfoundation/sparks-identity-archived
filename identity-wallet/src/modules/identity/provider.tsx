import React, { useContext, createContext } from 'react'
import * as utils from './utilities'
import defaultAvatar from './avatar'
import { storage } from '../utilities/storage'

interface IdentityContextType {
  name: string | null,
  nonce: string | null,
  avatar: string,
  publicKey: string | null,
  login: Function,
  logout: Function,
  create: Function,
  setName: Function,
  setAvatar: Function,
  encrypt: Function,
}

interface keys {
  encryption: {
    publicKey: string | null,
    secretKey: string | null,
  },
  signing: {
    publicKey: string | null,
    secretKey: string | null,
  }
}

export const IdentityContext = createContext<IdentityContextType>({
  name: null,
  nonce: null,
  avatar: defaultAvatar,
  publicKey: null,
  login: () => { },
  logout: () => { },
  create: () => { },
  setName: () => { },
  setAvatar: () => { },
  encrypt: () => { },
})

export const useIdentity = () => useContext(IdentityContext)

export default class IdentityProvider extends React.Component {
  private keys: keys;

  state = {
    name: null,
    nonce: null,
    avatar: defaultAvatar,
    publicKey: null,
  }

  get name() { return this.state.name }
  get avatar() { return this.state.avatar  }
  get nonce() { return this.state.nonce }
  get publicKey() { return this.state.publicKey }

  constructor(props: any) {
    super(props)
    this.keys = {
      encryption: { publicKey: null, secretKey: null },
      signing: { publicKey: null, secretKey: null }
    }
  }

  create = ({ name, password }: { name: string, password: string }) => {
    return new Promise(async (resolve) => {
      const nonce = utils.randomNonce()
      const keys = await utils.keypairsFromPassword({ nonce, password })
      const publicKey = keys.signing.publicKey
      const avatar = defaultAvatar
      this.keys = keys
      this.setState({
        name,
        nonce,
        avatar,
        publicKey,
      }, async () => {
        if (!this.nonce) return
        await storage.setItem(this.nonce, this.encrypt())
        resolve(true)
      })
    })
  }

  login = ({ identity: data, nonce, password }: { identity: string, nonce: string, password: string }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const keys = await utils.keypairsFromPassword({ nonce, password })
        const secretKey = keys.encryption.secretKey
        const publicKey = keys.signing.publicKey
        const state = utils.secretbox.decrypt({ data, secretKey })
        this.keys = keys
        this.setState({
          ...state,
          publicKey,
        }, async () => {
          if (!this.nonce) return
          await storage.setItem(this.nonce, this.encrypt())
          resolve(true)
        })
      } catch ({ message }: any) {
        reject(message)
      }
    })
  }

  logout = () => {
    return new Promise((resolve) => {
      this.setState({
        name: null,
        nonce: null,
        avatar: null,
        publicKey: null,
      }, () => resolve(true))
    })
  }

  encrypt = (): string => {
    const encrypted = utils.secretbox.encrypt({
      // @ts-ignore
      data: this.toJSON(),
      // @ts-ignore
      secretKey: this.keys.encryption.secretKey,
    })
    if (!this.name) throw Error('invalid')
    return `${utils.asciiToBase64(this.name)} ${this.nonce} ${encrypted}`
  }

  toJSON = () => {
    return this.state
  }

  setName = (name: string) => {
    return new Promise((resolve) => {
      const update = { ...this.state, name }
      this.setState(update, async () => {
        if (!this.nonce) return
        await storage.setItem(this.nonce, this.encrypt())
        resolve(true)
      })
    })
  }

  setAvatar = (avatar: string) => {
    return new Promise((resolve) => {
      const update = { ...this.state, avatar }
      this.setState(update, async () => {
        if (!this.nonce) return
        await storage.setItem(this.nonce, this.encrypt())
        resolve(true)
      })
    })
  }

  render = () => {
    const value = {
      ...this.state,
      login: this.login,
      logout: this.logout,
      create: this.create,
      setName: this.setName,
      setAvatar: this.setAvatar,
      encrypt: this.encrypt,
    }

    return (
      <IdentityContext.Provider value={value}>
        {/* 
        // @ts-ignore */}
        {this.props.children}
      </IdentityContext.Provider>
    )
  }
}
