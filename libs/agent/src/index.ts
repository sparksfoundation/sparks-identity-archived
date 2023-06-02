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
  nextKeys?: string[];
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
      signingKeys: [publicSigningKey],  // k: list of signing keys
      nextKeys: [nextKeyHash],  // n: next keys, added encryption because it makes sense imo
      witnessThreshold: "1",  // wt: minimum amount of witnesses threshold - I think these are called backers now
      witnesses: [witnesses],  // w: list of witnesses in this case the spark pwa-agent host's publickey there's no receipt at this step
    } as any // todo -- fix this type

    // add the version and the SAID
    const eventJSON = JSON.stringify(inceptionEvent)
    const version = 'KERI10JSON' + eventJSON.length.toString(16).padStart(6, '0') + '_';
    const hashedEvent = util.encodeBase64(blake3(eventJSON));
    const signedEventHash = this.sign({ message: hashedEvent, detached: true })

    // v: KERIvvSSSSSS_ KERI version SIZE _
    inceptionEvent.version = version;
    inceptionEvent.selfAddressingIdentifier = signedEventHash;

    // todo -- queue the receipt request

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

    this.#keyPairs = { ...keyPairs }
    const oldKeyEvent = this.#keyEventLog[this.#keyEventLog.length - 1]
    const publicSigningKey = this.#keyPairs.signing.publicKey
    const nextKeyHash = util.encodeBase64(blake3(util.decodeBase64(nextKey)))

    const rotationEvent = {
      identifier: this.#identifier,
      eventIndex: (parseInt(oldKeyEvent.eventIndex) + 1).toString(),
      eventType: "rotation",
      signatureThreshold: oldKeyEvent.signatureThreshold,
      signingKeys: [publicSigningKey],
      nextKeys: [nextKeyHash],
      witnessThreshold: oldKeyEvent.witnessThreshold,
      witnesses: [...oldKeyEvent.witnesses],
    } as any // todo -- fix this type

    const eventJSON = JSON.stringify(rotationEvent)
    const version = 'KERI10JSON' + eventJSON.length.toString(16).padStart(6, '0') + '_';
    const hashedEvent = util.encodeBase64(blake3(eventJSON));
    const signedEventHash = this.sign({ message: hashedEvent, detached: true })

    rotationEvent.version = version;
    rotationEvent.selfAddressingIdentifier = signedEventHash;

    // todo queue witness receipt request

    this.#keyEventLog.push(rotationEvent)
  }

  destroy() {
  }

  encrypt({ data, publicKey, sharedKey }: { data: object | string, publicKey?: string, sharedKey?: string }): string {
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

  verify({ publicKey, signature, message }) {
    if (!!message) {
      if (typeof message !== 'string' && !message as any instanceof String) {
        message = util.decodeUTF8(this.__parseJSON(message))
      }
      message = util.decodeUTF8(message)
    }
    
    const uintSignature = util.decodeBase64(signature)
    const uintPublicKey = util.decodeBase64(publicKey)

    return message 
      ? nacl.sign.detached.verify(message, uintSignature, uintPublicKey)
      : nacl.sign.open(uintSignature, uintPublicKey)
  }

  witness(event) { }

  // todo delete this eventually
  debug() {
    return {
      identifier: this.#identifier,
      //keyPairs: this.#keyPairs,
      publicKey: this.publicKeys.signing,
      nextKeys: this.#keyEventLog[this.#keyEventLog.length - 1].nextKeys,
      keyEventLog: this.#keyEventLog,
    }
  }

  toJSON() {
    return {
      identifier: this.#identifier,
      publicKeys: this.publicKeys,
    }
  }
}

(async function test() {
  let password, salt, keyPairs, nextKeyPairs, nextKey, identity;

  // incept a new identity with a password and salt to derive keyPairs
  console.log('\n\nlets derive some keyPairs from a password and salt.')
  console.log('we can use other methods like ephemeral keys, hardware')
  console.log('wallet or even things like biometrics in the future')
  console.log('----------------------------------------------------')
  password = 'test'
  salt = randomSalt()
  keyPairs = await keyPairsFromPassword({ password, salt })
  identity = new Identity({ keyPairs })
  nextKeyPairs = await keyPairsFromPassword({ password, salt: salt + identity.keyIndex })
  nextKey = nextKeyPairs.signing.publicKey
  console.log('our public keys:')
  console.log({ signing: keyPairs.signing.publicKey, encryption: keyPairs.encryption.publicKey }, '\n\n')

  console.log('lets incept our identity with a nextKey and witnesses')
  console.log('verifiers can choose to trust particular witnesses, or none at all')
  console.log('this means no friction for casual peer networks and high security for others')
  console.log('imagine a bank deduplicating and witnessing a subset of the network')
  console.log('----------------------------------------------------')
  identity.incept({ nextKey, witnesses: ['sparks_server_public_key'] })
  console.log('our identifier:', identity.identifier)
  console.log('our public signing key:', identity.publicKeys.signing)
  console.log('our public encryption key:', identity.publicKeys.encryption, '\n\n')
  //console.log(JSON.stringify(identity.debug(), null, 2))
  // let's rotate the keys
  console.log('lets rotate our keys with a nextKey and witnesses')
  console.log('imagine you want to upgrade to a more trusted witness')
  console.log('or maybe your keys got compromised and you need to disable this identity')
  console.log('you can rotate the keys without changing the identifier or losing history')
  console.log('----------------------------------------------------')
  keyPairs = await keyPairsFromPassword({ password, salt: salt + (identity.keyIndex - 1) })
  nextKeyPairs = await keyPairsFromPassword({ password, salt: salt + identity.keyIndex })
  nextKey = nextKeyPairs.signing.publicKey
  await identity.rotate({ keyPairs, nextKey, witnesses: ['sparks_server_public_key'] })
  console.log('our identifier is the same:', identity.identifier)
  console.log('our new public signing key:', identity.publicKeys.signing)
  console.log('our new public encryption key:', identity.publicKeys.encryption, '\n\n')
  //console.log(JSON.stringify(identity.debug(), null, 2))

  // let's change the password, this takes two rotations
  // we need a new keyPair with our new password and salt
  // the salt should use the index + 2 because that's where we're going in the event sequence
  const newPassword = 'new password'
  const newSalt = randomSalt()

  console.log('lets change our password, for whatever reason')
  console.log('we need to rotate the keys twice to do this')
  console.log('why? to maintain the chain of trust we have to honor the')
  console.log('previous commitments to the nextKey which happened with the old password')
  console.log('----------------------------------------------------')
  // first we must honor the nextKey with our old password and salt
  keyPairs = await keyPairsFromPassword({ password, salt: salt + (identity.keyIndex - 1) })
  nextKeyPairs = await keyPairsFromPassword({ password: newPassword, salt: newSalt + identity.keyIndex })
  nextKey = nextKeyPairs.signing.publicKey
  await identity.rotate({ keyPairs, nextKey, witnesses: ['sparks_server_public_key'] })

  // then provide a new keyPair derived from our new password
  keyPairs = await keyPairsFromPassword({ password: newPassword, salt: newSalt + (identity.keyIndex - 1) })
  nextKeyPairs = await keyPairsFromPassword({ password: newPassword, salt: newSalt + identity.keyIndex })
  nextKey = nextKeyPairs.signing.publicKey
  await identity.rotate({ keyPairs, nextKey, witnesses: ['sparks_server_public_key'] })
  console.log('password updated!')
  console.log('our identifier is the same:', identity.identifier)
  console.log('our new public signing key:', identity.publicKeys.signing)
  console.log('our new public encryption key:', identity.publicKeys.encryption, '\n\n')

  // let's verify the chain starting with event 0
  // we should have a helper for this as part of a Verifier extension class... Identity extends Verifier
  console.log('let\'s verify out identities chain of events starting with event 0')
  console.log('each event is signed by the previous event\'s nextKey')
  console.log('and the event data is signed by the event\'s signing key')
  console.log('this means we can verify the chain of events and the data integrity at every step')
  console.log('we have the inception event, and three rotations to check')
  console.log('----------------------------------------------------')
  const events = identity.debug().keyEventLog
  events.forEach((event, index) => {
    // what's happening here... it's checking that the event hasn't been tampered with
    const { selfAddressingIdentifier, version, ...eventBody } = event
    const message = util.encodeBase64(blake3(JSON.stringify(eventBody)))
    const dataInTact = identity.verify({ message, signature: selfAddressingIdentifier, publicKey: event.signingKeys[0] })
    console.log('event data trustworthy:', dataInTact)

    // let's check that the current key is the same as the previous committed to using 
    if (index > 0) {
      const keyCommittment = events[index - 1].nextKeys[0]
      const currenKey = util.encodeBase64(blake3(util.decodeBase64(event.signingKeys[0])))
      const committmentValid = currenKey === keyCommittment
      console.log('key commitment in tact:', committmentValid)
    }
  })
}())
