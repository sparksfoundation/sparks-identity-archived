import React, { useContext, createContext } from 'react'
import Identity from './Identity';
import { storage } from '../utilities/storage';

type Nullable<T> = T | null;

type TIdentityProps = {
  readonly name: Nullable<string>;
  readonly nonce: Nullable<string>;
  readonly avatar: Nullable<string>;
  readonly keyIndex: Nullable<number>;
  readonly eventLog: Array<{
    type: string;
    currentPublicKey: string;
    nextPublicKeyHash: string;
    signedEvent?: string;
  }>;
  readonly publicKey?: Nullable<string>;
}

interface IdentityContextType {
  readonly name: Nullable<string>;
  readonly nonce: Nullable<string>;
  readonly avatar: Nullable<string>;
  readonly keyIndex: Nullable<number>;
  readonly eventLog: Array<{
    type: string;
    currentPublicKey: string;
    nextPublicKeyHash: string;
    signedEvent?: string;
  }>;
  readonly publicKeys?: Nullable<object>;
  readonly identifier?: Nullable<string>;
  readonly save: Function;
  readonly login: Function;
  readonly logout: Function;
  readonly create: Function;
  readonly setName: Function;
  readonly setAvatar: Function;
  readonly rotateKeys: Function;
}

export const IdentityContext = createContext<IdentityContextType>({
  name: null,
  nonce: null,
  avatar: null,
  keyIndex: null,
  eventLog: [],
  publicKeys: null,
  identifier: null,
  save: () => { },
  login: () => { },
  logout: () => { },
  create: () => { },
  setName: () => { },
  setAvatar: () => { },
  rotateKeys: () => { },
})

export const useIdentity = () => useContext(IdentityContext)

export default class IdentityProvider extends React.Component {
  #identity = new Identity()
  state = {} as TIdentityProps

  constructor(props: any) {
    super(props)
    this.state = { ...this.#identity }
    this.save = this.save.bind(this)
    this.login = this.login.bind(this)
    this.logout = this.logout.bind(this)
    this.create = this.create.bind(this)
    this.save = this.save.bind(this)
    this.setName = this.setName.bind(this)
    this.setAvatar = this.setAvatar.bind(this)
    this.rotateKeys = this.rotateKeys.bind(this)
  }

  async update() {
    return new Promise(async (resolve) => {
      this.setState({ 
        ...this.#identity, 
        publicKeys: this.#identity.publicKeys,
        identifier: this.#identity.identifier,
      }, async () => {
        resolve(true)
      })
    })
  }

  async save() {
    if (!this.state.nonce || !this.state.name) return
    const data = await this.#identity.export()
    await storage.setItem(this.state.nonce, data)
  }

  async login({ identity, password }: { identity: string, password: string }) {
    await this.#identity.import({ identity, password })
    await this.update()
  }

  async logout() { }

  async create({ name, password }: { name: string, password: string }) {
    await this.#identity.create({ name, password })
    await this.update()
    await this.save()
  }

  async setName(name : string) {
    this.#identity.name = name
    await this.update()
    await this.save()
  }

  async setAvatar(avatar : string) {
    this.#identity.avatar = avatar
    await this.update()
    await this.save()
  }

  async rotateKeys() {
    await this.#identity.rotate()
    await this.update()
    await this.save()
  }

  render = () => {
    const value = {
      ...this.state,
      save: this.save,
      login: this.login,
      logout: this.logout,
      create: this.create,
      setName: this.setName,
      setAvatar: this.setAvatar,
      rotateKeys: this.rotateKeys,
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
