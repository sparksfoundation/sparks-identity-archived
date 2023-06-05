import nacl from "tweetnacl";
import util from "tweetnacl-util";

export class Channel {
    constructor({ target, origin, keyPairs, publicKeys }) {
        const sharedKey = this.generateSharedKey({ keyPairs, publicKeys })
        this.keyPairs = keyPairs;
        this.connection = {
            target,
            origin,
            publicKeys,
            sharedKey,
        }
        this.eventListeners = new Map();
        window.addEventListener('beforeunload', async () => {
            await this.disconnect()
        })
    }

    message(message) {
        if (!this.connection) throw new Error('not connected yet');
        const { ciphertext, signature } = this.encryptMessage(message);
        return new Promise((resolve, reject) => {
            const handleMessage = (event) => {
                if (
                    event.source === this.connection.target &&
                    event.origin === this.connection.origin &&
                    event.data === 'messageConfirmation'
                ) {
                    window.removeEventListener('message', handleMessage);
                    resolve();
                }
            };
            window.addEventListener('message', handleMessage);
            this.connection.target.postMessage({ type: 'message', message: { ciphertext, signature } }, this.connection.origin);
        });
    }

    generateSharedKey({ keyPairs, publicKeys }) {
        const baseEncryptionPublicKey = util.decodeBase64(publicKeys.encryption)
        const baseEncryptionSecretKey = util.decodeBase64(keyPairs.encryption.secretKey)
        const uintSharedKey = nacl.box.before(baseEncryptionPublicKey, baseEncryptionSecretKey)
        const baseSharedKey = util.encodeBase64(uintSharedKey)
        return baseSharedKey
    }

    encryptMessage(decrypted) {
        const nonce = nacl.randomBytes(nacl.box.nonceLength);
        const message = JSON.stringify(decrypted);
        const uintMessage = util.decodeUTF8(message);
        const sharedKey = util.decodeBase64(this.connection.sharedKey);
        const encrypted = nacl.box.after(uintMessage, nonce, sharedKey);

        const uintCiphertext = new Uint8Array(nonce.length + encrypted.length);
        uintCiphertext.set(nonce);
        uintCiphertext.set(encrypted, nonce.length);

        const ciphertext = util.encodeBase64(uintCiphertext);
        const uintSecretKey = util.decodeBase64(this.keyPairs.signing.secretKey);
        const signature = util.encodeBase64(nacl.sign.detached(uintMessage, uintSecretKey));

        return { ciphertext, signature }
    }

    decryptMessage({ ciphertext, signature }) {
        const uintArrayMessageWithNonce = util.decodeBase64(ciphertext);
        const nonce = uintArrayMessageWithNonce.slice(0, nacl.box.nonceLength);
        const message = uintArrayMessageWithNonce.slice(nacl.box.nonceLength, ciphertext.length);
        const sharedKey = util.decodeBase64(this.connection.sharedKey);
        const decrypted = nacl.box.open.after(message, nonce, sharedKey);
        if (!decrypted) throw new Error("Decryption failed");

        const uintSignature = util.decodeBase64(signature);
        const uintSigningKey = util.decodeBase64(this.connection.publicKeys.signing);
        const validSignature = nacl.sign.detached.verify(decrypted, uintSignature, uintSigningKey);

        if (!validSignature) throw new Error("Invalid signature");

        return ({
            message: JSON.parse(util.encodeUTF8(decrypted)),
            publicKey: this.connection.publicKeys.signing,
            signature: signature,
        });
    }

    on(eventType, callback) {
        const allowed = ['message', 'disconnect']
        if (!allowed.includes(eventType)) return;

        const listener = (event) => {
            if (
                event.source === this.connection.target &&
                event.origin === this.connection.origin &&
                event.data?.type === eventType
            ) {
                const message = event.data?.type === 'message' ?
                    this.decryptMessage(event.data.message) :
                    event.data.message;

                callback(message);
            }
        };
        this.eventListeners.set(callback, listener);
        window.addEventListener('message', listener);
    }

    disconnect() {
        return new Promise((resolve, reject) => {
            const handleDisconnect = (event) => {
                if (
                    event.source === this.connection.target &&
                    event.origin === this.connection.origin &&
                    event.data === 'disconnectConfirmation'
                ) {
                    window.removeEventListener('message', handleDisconnect);
                    resolve();
                }
            };
            window.addEventListener('message', handleDisconnect);
            this.connection.target.postMessage({ type: 'disconnect' }, this.connection.origin);
        });
    }

    cleanup() {
        this.eventListeners.forEach((listener) => {
            window.removeEventListener('message', listener);
        });
    }
}

