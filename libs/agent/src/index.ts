import nacl from "tweetnacl";
import util from "tweetnacl-util";
import * as scrypt from 'scrypt-pbkdf';
import { nonceAndKeyPairFromPassword, randomKeyPair } from "./helpers.js";

export type KeyPair = {
  publicKey: string;
  secretKey: string
}

export type PublicKeys = {
  encryption: string;
  signing: string;
}

export type SecretKeys = {
  encryption: string;
  signing: string;
}

export type KeyPairs = {
  encryption: KeyPair,
  signing: KeyPair,
}
 
export type InceptionEvent = {}
export type RotationEvent = {}
export type DeletionEvent = {}
export type KeyEvents = InceptionEvent | RotationEvent | DeletionEvent

export type AttestationEvent = {}
export type RevocationEvent = {}
export type CredentialEvents = AttestationEvent | RevocationEvent

export type DisclosureEvent = {}
export type SelectiveDiscloureEvent = {}
export type PredicateEvent = {}
export type VerificationEvents = DisclosureEvent | SelectiveDiscloureEvent | PredicateEvent

export type PaymentIssuedEvent = {}
export type PaymentRecievedEvent = {}
export type PaymentSettledEvent = {}
export type TransactionEvents = PaymentIssuedEvent | PaymentRecievedEvent | PaymentSettledEvent

// todo model receipts after any event
type Receipts = {} 

type ChannelEvent = 'message' | 'witness' | 'receipt' | 'connected' | 'disconnected'
interface Channel extends Function {
  peer: { publicKeys: PublicKeys }
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  message: ({ data, mode }: { data: object | string, mode: 'EtS' | 'StE' }) => Promise<void>;
  on: ({ type, callback }: { type: ChannelEvent, callback: Function }) => void;
}

type InitArgs = {
  identifier: string;
  credentialEventLog?: CredentialEvents[],
  verificationEventLog?: VerificationEvents[],
  transactionEventLog?: TransactionEvents[],
  connections?: Channel[]
  keyEventLog?: [...KeyEvents[]],
}

class Identity {
  #identifier: string | undefined;
  #keyPairs: KeyPairs;
  #keyEventLog: KeyEvents[];
  #credentialEventLog: CredentialEvents[];
  #verificationEventLog: VerificationEvents[];
  #transactionEventLog: TransactionEvents[];
  #connections: Channel[];
  #receiptQueue: [];

  // the constructor only loads the keyPairs but wont be 
  // function until the identity is incepted or imported
  constructor({ keyPairs }: { keyPairs: KeyPairs }) {
    this.#keyPairs = keyPairs
  }

  private __init({
    identifier,
    keyEventLog = [],
    credentialEventLog = [],
    verificationEventLog = [],
    transactionEventLog = [],
    connections = [],
  }: InitArgs) {
    // todo - Error throwing for malformed args
    // todo - check that the identity is valid for keypair
    this.#identifier = identifier
    this.#keyEventLog = keyEventLog
    this.#credentialEventLog = credentialEventLog
    this.#verificationEventLog = verificationEventLog
    this.#transactionEventLog = transactionEventLog
    this.#connections = connections.map(connection => {
      return connection.bind(this)
    })
  }

  get identifier() {
    return this.#identifier
  }

  get publicKeys() {
    return {
      encryption: this.#keyPairs.encryption.publicKey,
      signing: this.#keyPairs.signing.publicKey,
    }
  }

  // convenience helper to return null if not valid
  private async __parseJSON(string) {
    return new Promise((resolve, reject) => {
      try { resolve(JSON.parse(string)) }
      catch (e: any) { resolve(null) }
    })
  }

  // imports identity data from encrypted string
  async import({ data }: { data: string }) {
    const isString = typeof data === 'string' || data as any instanceof String
    if (!isString) throw Error('can only import encrypted identity')
    const decrypted = await this.decrypt({ data })
    const parsed = await this.__parseJSON(decrypted)
    if (parsed) return this.__init(parsed as InitArgs)
  }

  // exports all public info encrypted
  async export() {
    const data = await this.__parseJSON(this)
    if (!data) throw Error('error exporting')
    const encrypted = await this.encrypt({ data: data as InitArgs })
    if (!encrypted) throw Error('error exporting')
    return encrypted
  }

  // generates inception event
  incept({ witness }: { witness: string }) { 
    // probably check of the inception event
    if (this.#identifier || this.#keyEventLog.length) {
      throw Error('identity already incepted')
    }

    // todo figure out how to generate the identifier
    // I think we just hash the inception event maybe 
    const icp = {

    }

    const identifier = `D${this.publicKeys.signing}--minus padding`
    // todo - rotate the keypair

    // todo - form the inception event

    // todo - queue for witness and receipt from external process
  }

  // rotate the keys
  rotate() { }
  destroy() { }

  encrypt({ data, publicKey, sharedKey }: { data: object | string, publicKey?: string, sharedKey?: string }): string {
    console.log(this.#keyPairs)
    return ''
  }
  decrypt({ data, publicKey, sharedKey }: { data: object | string, publicKey?: string, sharedKey?: string }): string {
    return ''
  }

  sign({ message, detached }){}
  verify({ message, signature, publicKey }){}
  witness(event){}

  toJSON() {
    return {
      identifier: this.#identifier,
      publicKeys: this.publicKeys,
    }
  }
}


(async function test() {
  // master keys -> this has nothing to do with your identity it's just to lock / unlock your data into storage
  const { publicKey, secretKey, nonce } = await nonceAndKeyPairFromPassword({ password: 'asdfasdfasdf' })

  // generate a random keypair to create a new identity
  const keyPairs = randomKeyPair()

  // 
  const identity = new Identity({ keyPairs })
}())
