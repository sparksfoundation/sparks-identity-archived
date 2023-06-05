import util from "tweetnacl-util";
import { KeyPairs, PublicKeys } from "../forge/types"
import nacl from "tweetnacl";

export class PostMessage {
  #source: Window;
  #keyPairs: KeyPairs;
  #sharedKey: string;
  #listeners: Map<Function, Function>;
  #encrypt: Function;
  #decrypt: Function;
  #sign: Function;
  #verify: Function;
  target: Window;
  origin: string;
  publicKeys: PublicKeys;

  static generateSharedKey({ keyPairs, publicKeys }) {
    const baseEncryptionPublicKey = util.decodeBase64(publicKeys.encryption)
    const baseEncryptionSecretKey = util.decodeBase64(keyPairs.encryption.secretKey)
    const uintSharedKey = nacl.box.before(baseEncryptionPublicKey, baseEncryptionSecretKey)
    const baseSharedKey = util.encodeBase64(uintSharedKey)
    return baseSharedKey
  }

  constructor({ keyPairs, encrypt, decrypt, sign, verify, source }) {
    this.#keyPairs = keyPairs;
    this.#encrypt = encrypt;
    this.#decrypt = decrypt;
    this.#sign = sign;
    this.#verify = verify;
    this.#listeners = new Map();
    window = source || window;
    window.addEventListener('beforeunload', async () => {
      await this.disconnect()
    })
  }

  accept({ url }) {
    return new Promise((resolve, reject) => {
      const origin = new URL(url).origin;

      const handler = (event) => {
        if (event.data.type !== 'connectionRequest') return;
        if (event.origin !== origin) return;
        if (!event.data.publicKeys) return;

        event.source.postMessage({
          type: 'connectionConfirmation',
          publicKeys: {
            signing: this.#keyPairs.signing.publicKey,
            encryption: this.#keyPairs.encryption.publicKey,
          }
        }, event.origin);

        this.target = window.opener;
        this.origin = event.origin;
        this.publicKeys = event.data.publicKeys;
        this.#sharedKey = PostMessage.generateSharedKey({ keyPairs: this.#keyPairs, publicKeys: this.publicKeys });
        this.target.postMessage({ type: 'connected' }, this.origin);
        window.removeEventListener('message', handler);
        resolve(this);
      }
      window.addEventListener('message', handler);
    })
  }

  connect({ url }) {
    return new Promise((resolve, reject) => {
      const origin = new URL(url).origin;
      const target = window.open(url, origin);
      if (!target) return reject(new Error('Failed to open window'));

      const interval = setInterval(() => {
        target.postMessage({
          type: 'connectionRequest',
          publicKeys: {
            signing: this.#keyPairs.signing.publicKey,
            encryption: this.#keyPairs.encryption.publicKey,
          }
        }, origin);
      }, 1000);

      const handler = (event) => {
        if (event.origin !== origin) return;
        if (event.data.type !== 'connectionConfirmation') return;
        if (!event.data.publicKeys) return;

        this.target = target;
        this.origin = origin;
        this.publicKeys = event.data.publicKeys;
        this.#sharedKey = PostMessage.generateSharedKey({ keyPairs: this.#keyPairs, publicKeys: this.publicKeys });
        this.target.postMessage({ type: 'connected' }, this.origin);
        window.removeEventListener('message', handler);
        clearInterval(interval);
        resolve(this);
      }
      window.addEventListener('message', handler);
    })
  }

  disconnect() {
    return new Promise((resolve, reject) => {
      const handleDisconnect = (event) => {
        if (
          event.source === this.target &&
          event.origin === this.origin &&
          event.data === 'disconnectConfirmation'
        ) {
          window.removeEventListener('message', handleDisconnect);
          resolve(true);
        }
      };
      this.target.postMessage({ type: 'disconnected' }, this.origin);
      window.addEventListener('message', handleDisconnect);
    });
  }

  send(data) {
    if (!this.target) throw new Error('not connected yet');
    const ciphertext = this.#encrypt({ data, sharedKey: this.#sharedKey });
    const signature = this.#sign({ data: ciphertext, detached: true });

    return new Promise((resolve, reject) => {
      const handleMessage = (event) => {
        if (
          event.source === this.target &&
          event.origin === this.origin &&
          event.data === 'messageConfirmation'
        ) {
          window.removeEventListener('message', handleMessage);
          resolve(true);
        }
      };
      window.addEventListener('message', handleMessage);
      this.target.postMessage({ type: 'message', message: { ciphertext, signature } }, this.origin);
    });
  }

  on(eventType, callback) {
    const allowed =  ['message', 'disconnected', 'connected']
    if (!allowed.includes(eventType)) return;

    const listener = (event) => {
      if (
        event.source === this.target &&
        event.origin === this.origin &&
        event.data?.type === eventType
      ) {
        if (event.data?.type !== 'message') {
          return callback(event.data.message)
        }
        const { signature, ciphertext } = event.data.message;
        const verified = this.#verify({ data: ciphertext, signature, publicKey: this.publicKeys.signing });
        if (!verified) return;
        const message = this.#decrypt({ data: ciphertext, sharedKey: this.#sharedKey });
        callback(message);
      }
    };
    this.#listeners.set(callback, listener);
    window.addEventListener('message', listener);
  }
}
