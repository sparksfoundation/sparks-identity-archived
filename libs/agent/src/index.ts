import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { blake3 } from '@noble/hashes/blake3';
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
  constructor() { }

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

  // convenience helper to return null if not valid
  private async __parseJSON(string) {
    return new Promise((resolve, reject) => {
      try { resolve(JSON.parse(string)) }
      catch (e: any) { resolve(null) }
    })
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
  incept({ noise = [], witness }: { noise?: string[], witness: string }) {
    // probably check of the inception event
    if (this.#identifier || this.#keyEventLog.length) {
      throw Error('Identity already incepted')
    }

    if (!witness) {
      throw Error('Witness public key required for inception')
    }

    // generate a random key pair if none provided
    const keyPairs = this.__randomKeyPairs({ noise: noise[0] })

    // https://identity.foundation/keri/kids/kid0001.html
    const publicSigningKey = keyPairs.signing.publicKey
    const identifier = `B${keyPairs.signing.publicKey.replace(/=$/, '')}`

    const nextKeyPairs = this.__randomKeyPairs({ noise: noise[1] })
    const nextSigningKey = util.encodeBase64(blake3(nextKeyPairs.signing.publicKey))
    const nextEncryptionKey = util.encodeBase64(blake3(nextKeyPairs.encryption.publicKey))

    // todo figure out how to generate the identifier
    // I think we just hash the inception event maybe 
    const inceptionEvent = {
      version: "",  // v: KERIvvSSSSSS_ KERI version SIZE _
      identifier: identifier,  // i: AID identifier prefix
      eventIndex: "0",  // s: sequence number
      eventType: "inception",  // t: event type
      signatureThreshold: "1",  // kt: minimum amount of signatures needed for this event to be valid (multisig)
      signingKey: publicSigningKey,  // k: list of signing keys
      nextKeys: [ nextSigningKey, nextEncryptionKey ],  // n: next keys, added encryption because it makes sense imo
      witnessThreshold: "1",  // wt: minimum amount of witnesses threshold
      witnesses: [witness],  // w: list of witnesses in this case the spark pwa-agent host's publickey there's no receipt at this step
      configuration: { // useful information maybe
        hashAlgorithm: "Blake3-256",
        keyCurves: { signing: "Ed25519", encryption: "Curve25519" },
        nextKeyCurves: { signing: "Ed25519", encryption: "Curve25519" }
      },
    }

    const inceptionEventJSON = JSON.stringify(inceptionEvent)
    const versionString = 'KERI10JSON' + inceptionEventJSON.length.toString(16).padStart(6, '0') + '_';
    inceptionEvent.version = versionString;

    this.__init({
      identifier,
      keyPairs,
      keyEventLog: [ inceptionEvent ], // this should be append and read only later, we can use offline hypercore 
    })
  }

  // rotate the keys
  rotate(args?: { noise?: string, witnesses?: string[] }) {
    const { noise, witnesses } = args || {};
    
    if (!this.#identifier || !this.#keyEventLog.length) {
      throw new Error('Identity not incepted yet')
    }

    const nextKeyPairs = this.__randomKeyPairs({ noise })
    const nextSigningKey = util.encodeBase64(blake3(nextKeyPairs.signing.publicKey))
    const nextEncryptionKey = util.encodeBase64(blake3(nextKeyPairs.encryption.publicKey))
    const rotationEvent = {
      version: "", // Placeholder for version string
      identifier: this.#identifier,
      eventIndex: this.#keyEventLog.length.toString(), // Incremented event index
      eventType: "rotation",
      signatureThreshold: "1", 
      signingKeys: [this.#keyPairs.signing.publicKey],
      nextKeys: [nextSigningKey, nextEncryptionKey],
      witnessThreshold: "1", // minimum the witness threshold if needed
      configuration: {
        signingCurve: "Ed25519",
        encryptionCurve: "Curve25519",
        hashAlgorithm: "Blake3-256",
        nextKeyCurves: ["Ed25519", "Curve25519"]
      }
    }

    const rotationEventJSON = JSON.stringify(rotationEvent)
    const versionString = `KERI10JSON${rotationEventJSON.length.toString(16).padStart(6, '0')}_`
    rotationEvent.version = versionString

    this.#keyEventLog.push(rotationEvent)

    // we also need to request event receipts we can do that by queueing receipt requests
    if (!witnesses) return
    witnesses.forEach(witness => {
      const receipt = {
        eventIndex: rotationEvent.eventIndex,
        witnesses: witnesses,
        signatures: [],
      }
      this.#transportQueue.push(receipt)
    })
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

  sign({ message, detached }) { }
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
  // master keys -> this has nothing to do with your identity it's just to lock / unlock your data into storage
  const { publicKey, secretKey, nonce } = await nonceAndKeyPairFromPassword({ password: 'asdfasdfasdf' })

  // generate a random keypair to create a new identity
  const keyPairs = randomKeyPair()

  // 
  const identity = new Identity()
  identity.incept({ noise: ['tes', 's'], witness: 'somekey' })
  console.log(JSON.stringify(identity, null, 2))
  identity.rotate()
  console.log(JSON.stringify(identity, null, 2))
}())
