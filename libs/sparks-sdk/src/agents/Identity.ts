import util from "tweetnacl-util";
import { KeyPairs, PublicSigningKey } from "../forge/types.js";
import { blake3 } from '@noble/hashes/blake3';
import nacl from "tweetnacl";

type InceptProps = undefined | {
  keyPairs: KeyPairs;
  nextSigningKey: PublicSigningKey;
  backers?: PublicSigningKey[];
}

type RotateProps = undefined | {
  keyPairs: KeyPairs;
  nextSigningKey: PublicSigningKey;
  backers?: PublicSigningKey[];
}

interface IdentityInterface {
  incept(args?: InceptProps): void | never;
  rotate(args?: RotateProps): void | never;
  destroy(): void | never;
  encrypt({ data, publicKey, sharedKey }: { data: object | string; publicKey?: string; sharedKey?: string; }): string;
  decrypt({ data, publicKey, sharedKey }: { data: object | string; publicKey?: string; sharedKey?: string; }): string;
  sign({ message, detached }: { message: object | string; detached?: boolean }): string;
  verify({ publicKey, signature, message }: { publicKey: string; signature: string; message: object | string }): boolean | string;
}

export class Identity implements IdentityInterface {
  #keyPairs: KeyPairs;
  #identifier: string;
  #keyEventLog: object[];

  // convenience helper to return null if not valid
  private __parseJSON(string) {
    if (typeof string !== 'string') return null;
    try {
      return JSON.parse(string);
    } catch (e: any) {
      return null;
    }
  }

  toJSON() {
    return {
      identifier: this.#identifier,
      keyEventLog: this.#keyEventLog,
    };
  }

  constructor() {
  }

  get identifier() {
    return this.#identifier;
  }

  get keyEventLog() {
    return this.#keyEventLog;
  }

  incept(args?: InceptProps) {
    let { keyPairs, nextSigningKey, backers = [] } = args || {};

    if (!keyPairs) {
      throw new Error('Key pairs required for inception')
    }

    if (!nextSigningKey) {
      throw new Error('Next signing key commitment required for inception')
    }

    this.#keyPairs = keyPairs;
    const identifier = `B${this.#keyPairs.signing.publicKey.replace(/=$/, '')}`;
    const publicSigningKey = this.#keyPairs.signing.publicKey;
    const nextKeyHash = util.encodeBase64(blake3(util.decodeBase64(nextSigningKey)));

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
    const signedEventHash = this.sign({ message: hashedEvent, detached: true });

    // v: KERIvvSSSSSS_ KERI version SIZE _
    inceptionEvent.version = version;
    inceptionEvent.selfAddressingIdentifier = signedEventHash;

    // todo -- queue the receipt request
    this.#identifier = identifier;
    this.#keyEventLog = [inceptionEvent];
  }

  rotate(args?: RotateProps) {
    let { keyPairs, nextSigningKey, backers = [] } = args || {};

    if (!this.#identifier || !this.#keyEventLog.length) {
      throw Error('Keys can not be rotated before inception');
    }

    if (!keyPairs) {
      throw new Error('Key pairs required for rotation')
    }

    if (!nextSigningKey) {
      throw new Error('Next signing key committment required for rotation')
    }

    this.#keyPairs = keyPairs;
    const oldKeyEvent = this.#keyEventLog[this.#keyEventLog.length - 1] as any;
    const publicSigningKey = this.#keyPairs.signing.publicKey;
    const nextKeyHash = util.encodeBase64(blake3(util.decodeBase64(nextSigningKey)));

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
    const signedEventHash = this.sign({ message: hashedEvent, detached: true });

    rotationEvent.version = version;
    rotationEvent.selfAddressingIdentifier = signedEventHash;

    // todo queue witness receipt request
    this.#keyEventLog.push(rotationEvent);
  }

  destroy() {}

  encrypt({ data, publicKey, sharedKey }: { data: object | string; publicKey?: string; sharedKey?: string; }): string {
    return '';
  }

  decrypt({ data, publicKey, sharedKey }: { data: object | string; publicKey?: string; sharedKey?: string; }): string {
    return '';
  }

  sign({ message, detached = false }: { message: object | string; detached?: boolean }) {
    if (typeof message !== 'string' && !((message as any) instanceof String)) {
      message = this.__parseJSON(message);
    }
    const uintMessage = util.decodeUTF8(message as string);
    const uintSecretKey = util.decodeBase64(this.#keyPairs.signing.secretKey);
    const signature = detached
      ? util.encodeBase64(nacl.sign.detached(uintMessage, uintSecretKey))
      : util.encodeBase64(nacl.sign(uintMessage, uintSecretKey));

    return signature;
  }

  verify({ publicKey, signature, message }) {
    if (!!message) {
      if (typeof message !== 'string' && (!message as any) instanceof String) {
        message = util.decodeUTF8(this.__parseJSON(message));
      }
      message = util.decodeUTF8(message);
    }

    const uintSignature = util.decodeBase64(signature);
    const uintPublicKey = util.decodeBase64(publicKey);

    if (message) {
      return nacl.sign.detached.verify(message, uintSignature, uintPublicKey)
    } else {
      const uintResult = nacl.sign.open(uintSignature, uintPublicKey);
      if (uintResult === null) return uintResult;
      const utf8Result = util.encodeUTF8(uintResult);
      return this.__parseJSON(utf8Result) || utf8Result;
    }
  }
}