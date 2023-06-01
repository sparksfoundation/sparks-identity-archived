import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { blake3 } from '@noble/hashes/blake3';
import { keyPairsFromPassword, randomSalt, signingKeysFromPassword } from "./forge.js";

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

export type Event = {
  eventIndex: string;
  signatureThreshold: string;
  witnessThreshold: string;
  witnesses: string[];
  configuration: object | object[] | string[];
}
export type InceptionEvent = Event & {}
export type RotationEvent = Event & {}
export type DeletionEvent = Event & {}
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
type Receipt = {}

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
  keyPairs: KeyPairs;
  credentialEventLog?: CredentialEvents[];
  verificationEventLog?: VerificationEvents[];
  transactionEventLog?: TransactionEvents[];
  connections?: Channel[];
  transportQueue?: any[]; // todo figure this out
  keyEventLog?: [...KeyEvents[]];
}

class Identity {
  #identifier: string;
  #keyPairs: KeyPairs;
  #keyEventLog: KeyEvents[] = [];
  #credentialEventLog: CredentialEvents[] = [];
  #verificationEventLog: VerificationEvents[] = [];
  #transactionEventLog: TransactionEvents[] = [];
  #transportQueue: any[] = [];
  #connections: Channel[] = [];

  // the constructor only loads the identity but wont be 
  // functional until the identity is incepted or imported
  constructor({ keyPairs }: { keyPairs: KeyPairs }) {
    this.#keyPairs = keyPairs
  }

  private __init({
    identifier,
    keyPairs,
    keyEventLog = [],
    credentialEventLog = [],
    verificationEventLog = [],
    transactionEventLog = [],
    transportQueue = [],
    connections = [],
  }: InitArgs) {
    // todo - Error throwing for malformed args
    // todo - check that the identity is valid for keypair
    this.#identifier = identifier
    this.#keyPairs = keyPairs
    this.#keyEventLog = keyEventLog
    this.#credentialEventLog = credentialEventLog
    this.#verificationEventLog = verificationEventLog
    this.#transactionEventLog = transactionEventLog
    this.#transportQueue = transportQueue
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

  get keyIndex() {
    return this.#keyEventLog.length
  }

  // convenience helper to return null if not valid
  private __parseJSON(string) {
    if (typeof string !== 'string') return null
    try { return JSON.parse(string) }
    catch (e: any) { return null }
  }

  private __randomKeyPairs(args?: { noise?: string | undefined }) {
    const seed = args?.noise ? blake3(args.noise) : null
    const uintKeyPairs = {
      signing: seed ? nacl.sign.keyPair.fromSeed(seed as Uint8Array) : nacl.sign.keyPair(),
      encryption: seed ? nacl.box.keyPair.fromSecretKey(seed as Uint8Array) : nacl.box.keyPair()
    }

    const keyPairs = {
      encryption: {
        publicKey: util.encodeBase64(uintKeyPairs.encryption.publicKey),
        secretKey: util.encodeBase64(uintKeyPairs.encryption.secretKey),
      },
      signing: {
        publicKey: util.encodeBase64(uintKeyPairs.encryption.publicKey),
        secretKey: util.encodeBase64(uintKeyPairs.encryption.secretKey),
      }
    }
    return keyPairs
  }

  // imports identity data from encrypted string
  async import({ data }: { data: string }) {
    const isString = typeof data === 'string' || data as any instanceof String
    if (!isString) throw Error('can only import encrypted identity')
    const decrypted = await this.decrypt({ data })
    const parsed = this.__parseJSON(decrypted)
    if (parsed) return this.__init(parsed as InitArgs)
  }

  // exports all public info encrypted
  async export() {
    const data = this.__parseJSON(this)
    if (!data) throw Error('error exporting')
    const encrypted = await this.encrypt({ data: data as InitArgs })
    if (!encrypted) throw Error('error exporting')
    return encrypted
  }

  // generates inception event
  incept({ nextKey, witnesses }: { nextKey: string, witnesses?: string[] }) {
    // probably check of the inception event
    if (this.#identifier || this.#keyEventLog.length) {
      throw Error('Identity already incepted')
    }

    if (!witnesses?.length) {
      throw Error('Witness public key required for inception')
    }

    // https://identity.foundation/keri/kids/kid0001.html
    const publicSigningKey = this.#keyPairs.signing.publicKey
    const identifier = `B${this.#keyPairs.signing.publicKey.replace(/=$/, '')}`
    const nextKeyHash = util.encodeBase64(blake3(util.decodeBase64(nextKey)))

    const inceptionEvent = {
      identifier: identifier,  // i: AID identifier prefix
      eventIndex: "0",  // s: sequence number
      eventType: "inception", // t: event type
      signatureThreshold: "1",  // kt: minimum amount of signatures needed for this event to be valid (multisig)
      signingKey: [publicSigningKey],  // k: list of signing keys
      nextKeys: [nextKeyHash],  // n: next keys, added encryption because it makes sense imo
      witnessThreshold: "1",  // wt: minimum amount of witnesses threshold
      witnesses: [witnesses],  // w: list of witnesses in this case the spark pwa-agent host's publickey there's no receipt at this step
      configuration: [] // c: explore if we need anything here
    } as any // todo -- fix this type

    // add the version and the SAID
    const eventJSON = JSON.stringify(inceptionEvent)
    const version = 'KERI10JSON' + eventJSON.length.toString(16).padStart(6, '0') + '_';
    const hashedEvent = util.encodeBase64(blake3(eventJSON));
    const signedEventHash = this.sign({ message: hashedEvent })

    // v: KERIvvSSSSSS_ KERI version SIZE _
    inceptionEvent.version = version;
    inceptionEvent.selfAddressingIdentifier = signedEventHash;

    this.#identifier = identifier
    this.#keyEventLog.push(inceptionEvent)
  }

  // rotate the keys
  rotate({ keyPairs, nextKey, witnesses }: { keyPairs: KeyPairs, nextKey: string, witnesses?: string[] }) {
    // probably check of the inception event
    if (!this.#identifier || !this.#keyEventLog.length) {
      throw Error('Identity not incepted yet')
    }

    if (!witnesses?.length) {
      throw Error('Witness public key required for inception')
    }

    const oldKeyEvent = this.#keyEventLog[this.#keyEventLog.length - 1]

    this.#keyPairs = { ...keyPairs }

    const publicSigningKey = this.#keyPairs.signing.publicKey
    const nextKeyHash = util.encodeBase64(blake3(util.decodeBase64(nextKey)))

    const rotationEvent = {
      identifier: this.#identifier,
      eventIndex: (parseInt(oldKeyEvent.eventIndex) + 1).toString(),
      eventType: "rotation",
      signatureThreshold: oldKeyEvent.signatureThreshold,
      signingKey: [publicSigningKey],
      nextKeys: [nextKeyHash],
      witnessThreshold: oldKeyEvent.witnessThreshold,
      witnesses: [...oldKeyEvent.witnesses],
      configuration: Array.isArray(oldKeyEvent.configuration)
        ? [...oldKeyEvent.configuration] 
        : { ...oldKeyEvent.configuration }
    } as any // todo -- fix this type

    const eventJSON = JSON.stringify(rotationEvent)
    const version = 'KERI10JSON' + eventJSON.length.toString(16).padStart(6, '0') + '_';
    const hashedEvent = util.encodeBase64(blake3(eventJSON));
    const signedEventHash = this.sign({ message: hashedEvent })

    rotationEvent.version = version;
    rotationEvent.selfAddressingIdentifier = signedEventHash;

    console.log(rotationEvent)

    this.#keyEventLog.push(rotationEvent)
  }

  destroy() {
  }

  encrypt({ data, publicKey, sharedKey }: { data: object | string, publicKey?: string, sharedKey?: string }): string {
    console.log(this.#keyPairs)
    return ''
  }
  decrypt({ data, publicKey, sharedKey }: { data: object | string, publicKey?: string, sharedKey?: string }): string {
    return ''
  }

  sign({ message, detached = false }: { message: object | string, detached?: boolean }) {
    if (typeof message !== 'string' && !(message as any instanceof String)) {
      message = this.__parseJSON(message)
    }
    const uintMessage = util.decodeUTF8(message as string);
    const uintSecretKey = util.decodeBase64(this.#keyPairs.signing.secretKey);
    const signature = detached
      ? util.encodeBase64(nacl.sign.detached(uintMessage, uintSecretKey))
      : util.encodeBase64(nacl.sign(uintMessage, uintSecretKey))

    return signature
  }

  verify({ message, signature, publicKey }) { }
  witness(event) { }

  toJSON() {
    return {
      identifier: this.#identifier,
      publicKeys: this.publicKeys,
    }
  }
}

(async function test() {

  // create a new identity
  const password = 'test'
  const salt = randomSalt()
  const keyPairs = await keyPairsFromPassword({ password, salt })
  const identity = new Identity({ keyPairs })

  const nextKeyPairs = await keyPairsFromPassword({ password, salt: salt + identity.keyIndex })
  const nextKey = nextKeyPairs.signing.publicKey
  identity.incept({ nextKey, witnesses: ['sparks_server_public_key'] })
  
  console.log(JSON.stringify(identity, null, 2))

  // same as the previous step to replicate the "next keyPair"
  const replaceWithkeyPairs = await keyPairsFromPassword({ password, salt: salt + identity.keyIndex })
  const newNextKeyPair = await signingKeysFromPassword({ password, salt: salt + identity.keyIndex + 1 })
  const newNextKey = newNextKeyPair.publicKey
  await identity.rotate({ keyPairs: replaceWithkeyPairs, nextKey: newNextKey, witnesses: ['sparks_server_public_key'] })

  console.log(JSON.stringify(identity, null, 2))
}())
