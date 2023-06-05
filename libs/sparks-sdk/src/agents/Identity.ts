import util from "tweetnacl-util";
import { KeyPairs, PublicEncryptionKey, PublicSigningKey } from "../forge/types.js";
import { blake3 } from '@noble/hashes/blake3';
import nacl from "tweetnacl";

type InceptProps = {
  keyPairs: KeyPairs;
  nextKeyPairs: KeyPairs;
  backers?: PublicSigningKey[];
}

type RotateProps = {
  keyPairs: KeyPairs;
  nextKeyPairs: KeyPairs;
  backers?: PublicSigningKey[];
}

type DestroyProps = undefined | {
  backers?: PublicSigningKey[];
}

interface IdentityInterface {
  incept(args?: InceptProps): void | never;
  rotate(args?: RotateProps): void | never;
  destroy(args?: DestroyProps): void | never;
  encrypt({ data, publicKey, sharedKey }: { data: object | string; publicKey?: string; sharedKey?: string; }): string;
  decrypt({ data, publicKey, sharedKey }: { data: object | string; publicKey?: string; sharedKey?: string; }): string;
  sign({ data, detached }: { data: object | string; detached?: boolean }): string;
  verify({ publicKey, signature, data }: { publicKey: string; signature: string; data: object | string }): boolean | string;
  toJSON(): object;
  identifier: string;
  keyEventLog: object[];
  publicKeys: { signing: PublicSigningKey; encryption: PublicEncryptionKey; };
}

export class Identity implements IdentityInterface {
  #keyPairs: KeyPairs;
  #identifier: string;
  #keyEventLog: object[];
  #connections: object[] = [];

  // convenience to return null if not valid
  private __parseJSON(string) {
    if (typeof string !== 'string') return null;
    try {
      return JSON.parse(string);
    } catch (e: any) {
      return null;
    }
  }

  constructor() { }

  get connections() {
    return this.#connections;
  }

  get identifier() {
    return this.#identifier;
  }

  get keyEventLog() {
    return this.#keyEventLog;
  }

  get publicKeys() {
    return {
      signing: this.#keyPairs.signing.publicKey,
      encryption: this.#keyPairs.encryption.publicKey,
    };
  }

  incept({ keyPairs, nextKeyPairs, backers = [] }: InceptProps) {

    if (this.#identifier || this.#keyEventLog?.length) {
      throw Error('Identity already incepted');
    }

    if (!keyPairs) {
      throw new Error('Key pairs required for inception')
    }

    if (!nextKeyPairs) {
      throw new Error('Next signing key commitment required for inception')
    }

    this.#keyPairs = keyPairs;
    const identifier = `B${this.#keyPairs.signing.publicKey.replace(/=$/, '')}`;
    const publicSigningKey = this.#keyPairs.signing.publicKey;
    const nextKeyHash = util.encodeBase64(blake3(util.decodeBase64(nextKeyPairs.signing.publicKey)));

    const inceptionEvent = {
      identifier: identifier, // i: AID identifier prefix
      eventIndex: '0', // s: sequence number
      eventType: 'inception', // t: event type
      signingThreshold: '1', // kt: minimum amount of signatures needed for this event to be valid (multisig)
      signingKeys: [publicSigningKey], // k: list of signing keys
      nextKeyCommitments: [nextKeyHash], // n: next keys, added encryption because it makes sense imo
      backerThreshold: '1', // bt: minimum amount of witnesses threshold - I think these are called backers now
      backers: [...backers], // b: list of witnesses in this case the spark pwa-agent host's publickey there's no receipt at this step
    } as any; // todo -- fix this type

    // add the version and the SAID
    const eventJSON = JSON.stringify(inceptionEvent);
    const version = 'KERI10JSON' + eventJSON.length.toString(16).padStart(6, '0') + '_';
    const hashedEvent = util.encodeBase64(blake3(eventJSON));
    const signedEventHash = this.sign({ data: hashedEvent, detached: true });

    // v: KERIvvSSSSSS_ KERI version SIZE _
    inceptionEvent.version = version;
    inceptionEvent.selfAddressingIdentifier = signedEventHash;

    // todo -- queue the receipt request
    this.#identifier = identifier;
    this.#keyEventLog = [inceptionEvent];
  }

  rotate({ keyPairs, nextKeyPairs, backers = [] }: RotateProps) {
    if (!this.#identifier || !this.#keyEventLog?.length) {
      throw Error('Keys can not be rotated before inception');
    }

    if (!keyPairs) {
      throw new Error('Key pairs required for rotation')
    }

    if (!nextKeyPairs) {
      throw new Error('Next signing key committment required for rotation')
    }

    // todo -- fix this type
    if ((this.#keyEventLog[this.#keyEventLog.length - 1] as any).eventType === 'destruction') {
      throw new Error('Keys can not be rotated after destruction');
    }

    this.#keyPairs = keyPairs;
    const oldKeyEvent = this.#keyEventLog[this.#keyEventLog.length - 1] as any;
    const publicSigningKey = this.#keyPairs.signing.publicKey;
    const nextKeyHash = util.encodeBase64(blake3(util.decodeBase64(nextKeyPairs.signing.publicKey)));

    const rotationEvent = {
      identifier: this.#identifier,
      eventIndex: (parseInt(oldKeyEvent.eventIndex) + 1).toString(),
      eventType: 'rotation',
      signingThreshold: oldKeyEvent.signatureThreshold,
      signingKeys: [publicSigningKey],
      nextKeyCommitments: [nextKeyHash],
      backerThreshold: oldKeyEvent.backerThreshold,
      backers: [...backers],
    } as any; // todo -- fix this type

    const eventJSON = JSON.stringify(rotationEvent);
    const version = 'KERI10JSON' + eventJSON.length.toString(16).padStart(6, '0') + '_';
    const hashedEvent = util.encodeBase64(blake3(eventJSON));
    const signedEventHash = this.sign({ data: hashedEvent, detached: true });

    rotationEvent.version = version;
    rotationEvent.selfAddressingIdentifier = signedEventHash;

    // todo queue witness receipt request
    this.#keyEventLog.push(rotationEvent);
  }

  destroy(args: DestroyProps) {
    const { backers = [] } = args || {};
    if (!this.#identifier || !this.#keyEventLog?.length) {
      throw Error('Identity does not exist');
    }

    const oldKeyEvent = this.#keyEventLog[this.#keyEventLog.length - 1] as any;
    const publicSigningKey = this.#keyPairs.signing.publicKey;

    const rotationEvent = {
      identifier: this.#identifier,
      eventIndex: (parseInt(oldKeyEvent.eventIndex) + 1).toString(),
      eventType: 'destruction',
      signingThreshold: oldKeyEvent.signingThreshold,
      signingKeys: [publicSigningKey],
      nextKeyCommitments: [],
      backerThreshold: oldKeyEvent.backerThreshold,
      backers: [...backers],
    } as any; // todo -- fix this type

    const eventJSON = JSON.stringify(rotationEvent);
    const version = 'KERI10JSON' + eventJSON.length.toString(16).padStart(6, '0') + '_';
    const hashedEvent = util.encodeBase64(blake3(eventJSON));
    const signedEventHash = this.sign({ data: hashedEvent, detached: true });

    rotationEvent.version = version;
    rotationEvent.selfAddressingIdentifier = signedEventHash;

    // todo queue witness receipt request
    this.#keyEventLog.push(rotationEvent);
  }

  // todo -- add asymmetric key encryption options
  encrypt({ data, publicKey, sharedKey }: { data: object | string; publicKey?: string; sharedKey?: string; }): string {
    if (!this.#keyPairs) {
      throw new Error('No key pairs found, please import or incept identity')
    }

    const utfData = typeof data === 'string' ? data : JSON.stringify(data);
    const uintData = util.decodeUTF8(utfData);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);

    let box;
    if (publicKey) {
      const publicKeyUint = util.decodeBase64(publicKey);
      box = nacl.box(uintData, nonce, publicKeyUint, util.decodeBase64(this.#keyPairs.encryption.secretKey));
    } else if (sharedKey) {
      const sharedKeyUint = util.decodeBase64(sharedKey);
      box = nacl.box.after(uintData, nonce, sharedKeyUint);
    } else {
      const secreKeyUint = util.decodeBase64(this.#keyPairs.encryption.secretKey);
      box = nacl.secretbox(uintData, nonce, secreKeyUint);
    }

    const encrypted = new Uint8Array(nonce.length + box.length);
    encrypted.set(nonce);
    encrypted.set(box, nonce.length);
    return util.encodeBase64(encrypted);
  }

  decrypt({ data, publicKey, sharedKey }: { data: string; publicKey?: string; sharedKey?: string; }): string {
    if (!this.#keyPairs) {
      throw new Error('No key pairs found, please import or incept identity')
    }
    
    const uintDataAndNonce = util.decodeBase64(data);
    const nonce = uintDataAndNonce.slice(0, nacl.secretbox.nonceLength);
    const uintData = uintDataAndNonce.slice(nacl.secretbox.nonceLength, uintDataAndNonce.length);

    let decrypted;
    if (publicKey) {
      const publicKeyUint = util.decodeBase64(publicKey);
      decrypted = nacl.box.open(uintData, nonce, publicKeyUint, util.decodeBase64(this.#keyPairs.encryption.secretKey));
    } else if (sharedKey) {
      const sharedKeyUint = util.decodeBase64(sharedKey);
      decrypted = nacl.box.open.after(uintData, nonce, sharedKeyUint);
    } else {
      const secreKeyUint = util.decodeBase64(this.#keyPairs.encryption.secretKey);
      decrypted = nacl.secretbox.open(uintData, nonce, secreKeyUint);
    }

    if (!decrypted) {
      throw new Error('Could not decrypt message');
    }

    const utf8Result = util.encodeUTF8(decrypted);
    const result = this.__parseJSON(utf8Result) || utf8Result;
    return result;
  }

  sign({ data, detached = false }: { data: object | string; detached?: boolean }) {
    if (typeof data !== 'string') {
      data = this.__parseJSON(data);
    }
    const uintData = util.decodeUTF8(data as string);
    const uintSecretKey = util.decodeBase64(this.#keyPairs.signing.secretKey);
    const signature = detached
      ? util.encodeBase64(nacl.sign.detached(uintData, uintSecretKey))
      : util.encodeBase64(nacl.sign(uintData, uintSecretKey));

    return signature;
  }

  verify({ publicKey, signature, data }) {
    if (!!data) {
      if (typeof data !== 'string') {
        data = util.decodeUTF8(this.__parseJSON(data));
      }
      data = util.decodeUTF8(data);
    }

    const uintSignature = util.decodeBase64(signature);
    const uintPublicKey = util.decodeBase64(publicKey);

    if (data) {
      return nacl.sign.detached.verify(data, uintSignature, uintPublicKey)
    } else {
      const uintResult = nacl.sign.open(uintSignature, uintPublicKey);
      if (uintResult === null) return uintResult;
      const utf8Result = util.encodeUTF8(uintResult);
      return this.__parseJSON(utf8Result) || utf8Result;
    }
  }

  addConnection(Connection) {
    return new Connection({
      keyPairs: this.#keyPairs,
      encrypt: this.encrypt.bind(this),
      decrypt: this.decrypt.bind(this),
      sign: this.sign.bind(this),
      verify: this.verify.bind(this),
    });
  }

  toJSON() {
    return {
      identifier: this.#identifier,
      keyEventLog: this.#keyEventLog,
    };
  }
}