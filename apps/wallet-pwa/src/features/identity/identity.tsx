import nacl from 'tweetnacl'
import naclUtil from 'tweetnacl-util'
import * as scrypt from 'scrypt-pbkdf'
import { avatar } from './avatar.js'
import { Buffer } from 'buffer'

type Nullable<T> = T | null;

type TUserDetails = {
  name: string;
  password: string;
}

type TKeyPair = {
  publicKey: string;
  secretKey: string;
}

type TKeyPairs = {
  encryption: TKeyPair;
  signing: TKeyPair;
}

type TIdentityEvent = {
  type: string;
  currentPublicKey: string;
  nextPublicKeyHash: string;
  signedEvent?: string;
}

export type TIdentity = {
  name: Nullable<string>;
  nonce: Nullable<string>;
  avatar: Nullable<string>;
  keyIndex: Nullable<number>;
  eventLog: Array<TIdentityEvent>;
  identifier: Nullable<string>;
  publicKeys: Nullable<object>;
  getKeys: () => Nullable<TKeyPairs>;
  create: (userDetails: TUserDetails) => Promise<void>;
  rotate: () => Promise<void>;
  destroy: () => Promise<void>;
}

export class Identity implements TIdentity {
  name: Nullable<string> = null
  nonce: Nullable<string> = null
  avatar: Nullable<string> = null
  keyIndex: Nullable<number> = null
  eventLog: Array<TIdentityEvent> = []

  #mainKeys: Nullable<TKeyPairs> = null
  #currKeys: Nullable<TKeyPairs> = null
  #nextKeys: Nullable<TKeyPairs> = null

  get identifier() {
    if (!this.#mainKeys) return null
    return `B${this.#mainKeys.signing.publicKey.replace('=', '')}`
  }

  get publicKeys() {
    if (!this.#currKeys) return null
    return {
      signing: this.#currKeys.signing.publicKey,
      encryption: this.#currKeys.encryption.publicKey,
    }
  }

  getKeys() {
    return this.#currKeys
  }

  async create({ name, password }: { name: string, password: string }) {
    this.name = name
    this.avatar = avatar
    this.nonce = naclUtil.encodeBase64(nacl.randomBytes(nacl.box.nonceLength))
    this.#mainKeys = await this.keyPairsFromPassword({
      password,
      nonce: this.nonce,
    })
    this.#currKeys = await this.childKeyPairAtIndex(0)
    this.#nextKeys = await this.childKeyPairAtIndex(1)
    this.keyIndex = 1
    this.eventLog.push(this.event({ type: 'inception' }))
  }

  async rotate() {
    if (this.keyIndex === null) throw new Error('no current key index')
    this.#currKeys = { ...this.#nextKeys } as TKeyPairs
    this.#nextKeys = await this.childKeyPairAtIndex(this.keyIndex + 1)
    this.keyIndex += 1
    this.eventLog.push(this.event({ type: 'rotation' }))
  }

  async destroy() {
    this.#currKeys = { ...this.#nextKeys } as TKeyPairs
    this.#nextKeys = null
    this.eventLog.push(this.event({ type: 'rotation' }))
    await this.rotate()
  }

  export() {
    if (!this.name || !this.nonce || !this.keyIndex) {
      return null
    }
    const b64Identity = this.encrypt(this)
    if (!this.name) throw Error('invalid')
    const b64Name = Buffer.from(this.name).toString('base64')
    const b64KeyIndex = Buffer.from(this.keyIndex.toString()).toString('base64')
    return `${b64Name} ${this.nonce} ${b64KeyIndex} ${b64Identity}`
  }

  async import({ identity, password }: { identity: string, password: string }) {
    const [b64Name, b64Nonce, b64KeyIndex, b64Identity] = identity.split(' ')

    this.name = Buffer.from(b64Name, 'base64').toString()
    this.nonce = b64Nonce
    this.keyIndex = Number.parseInt(Buffer.from(b64KeyIndex, 'base64').toString())

    this.#mainKeys = await this.keyPairsFromPassword({
      password,
      nonce: b64Nonce,
    })

    this.#currKeys = await this.childKeyPairAtIndex(this.keyIndex - 1)
    this.#nextKeys = await this.childKeyPairAtIndex(this.keyIndex)

    const {
      avatar,
      eventLog,
    } = this.decrypt(b64Identity)

    this.avatar = avatar
    this.eventLog = eventLog
  }

  private decrypt(encrypted: string) {
    if (!this.#currKeys) {
      throw new Error('no current keys')
    }
    const secretKeyUint = naclUtil.decodeBase64(this.#currKeys.encryption.secretKey)
    const messageAndNonce = naclUtil.decodeBase64(encrypted)
    const boxNonce = messageAndNonce.slice(0, nacl.box.nonceLength)
    const message = messageAndNonce.slice(
      nacl.box.nonceLength,
      messageAndNonce.length
    )

    const payload = nacl.secretbox.open(message, boxNonce, secretKeyUint)
    if (!payload) throw Error('invalid password')
    const payloadString = naclUtil.encodeUTF8(payload)
    return JSON.parse(payloadString)
  }

  private encrypt(decrypted: object) {
    if (!this.#currKeys) {
      throw new Error('no current keys')
    }
    const dataString = JSON.stringify(decrypted)
    const secreKeyUint = naclUtil.decodeBase64(this.#currKeys?.encryption.secretKey)
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const message = naclUtil.decodeUTF8(dataString)
    const box = nacl.secretbox(message, nonce, secreKeyUint)
    const encrypted = new Uint8Array(nonce.length + box.length)
    encrypted.set(nonce)
    encrypted.set(box, nonce.length)
    return naclUtil.encodeBase64(encrypted)
  }

  private async childKeyPairAtIndex(index: number): Promise<TKeyPairs> {
    if (!this.#mainKeys) throw Error('main keys not loaded')
    const options = { N: 16384, r: 8, p: 1 }
    const secretKey = this.#mainKeys.encryption.secretKey
    const buffer = await scrypt.scrypt(secretKey, index.toString(), (nacl.box.secretKeyLength / 2), options)
    const seed = [...new Uint8Array(buffer)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')

    const uint8Seed = naclUtil.decodeUTF8(seed)
    const signing = nacl.sign.keyPair.fromSeed(uint8Seed)
    const encryption = nacl.box.keyPair.fromSecretKey(uint8Seed)

    return {
      encryption: {
        publicKey: naclUtil.encodeBase64(encryption.publicKey),
        secretKey: naclUtil.encodeBase64(encryption.secretKey),
      },
      signing: {
        publicKey: naclUtil.encodeBase64(signing.publicKey),
        secretKey: naclUtil.encodeBase64(signing.secretKey),
      }
    }
  }

  private async keyPairFromPassword({ nonce, password, signing = false }: { nonce: string, password: string, signing: boolean }): Promise<TKeyPair> {
    const options = { N: 16384, r: 8, p: 1 }
    const buffer = await scrypt.scrypt(password, nonce, (nacl.box.secretKeyLength / 2), options)
    const seed = [...new Uint8Array(buffer)]
      .map(x => x.toString(16).padStart(2, '0'))
      .join('')

    const uint8Seed = naclUtil.decodeUTF8(seed)
    const uint8Keypair = signing ?
      nacl.sign.keyPair.fromSeed(uint8Seed) :
      nacl.box.keyPair.fromSecretKey(uint8Seed)

    return {
      publicKey: naclUtil.encodeBase64(uint8Keypair.publicKey),
      secretKey: naclUtil.encodeBase64(uint8Keypair.secretKey),
    }

  }

  private async keyPairsFromPassword({ nonce, password }: { nonce: string, password: string }): Promise<TKeyPairs> {
    const encryption = await this.keyPairFromPassword({ nonce, password, signing: false })
    const signing = await this.keyPairFromPassword({ nonce, password, signing: true })

    return {
      encryption,
      signing,
    }
  }

  private event({ type }: { type: string }): TIdentityEvent {
    if (!this.#currKeys?.signing) throw Error('no current keys')
    if (!this.#nextKeys?.signing) throw Error('no current keys')

    const event = {
      type: type,
      currentPublicKey: this.#currKeys.signing.publicKey,
      nextPublicKeyHash: naclUtil.encodeBase64(nacl.hash(naclUtil.decodeBase64(this.#nextKeys.signing.publicKey))),
      signedEvent: undefined as string | undefined,
    }

    const message = naclUtil.decodeUTF8(JSON.stringify(event))
    const secretKey = naclUtil.decodeBase64(this.#currKeys.signing.secretKey)
    event.signedEvent = naclUtil.encodeBase64(nacl.sign(message, secretKey))

    return event
  }
}
