import nacl from "tweetnacl"
import util from "tweetnacl-util"
import * as scrypt from 'scrypt-pbkdf'
import { KeyPair, KeyPairs } from "."

export function randomKeyPair() {
    const encrypt = nacl.box.keyPair()
    const sign = nacl.sign.keyPair()
    return {
        encryption: {
            publicKey: util.encodeBase64(encrypt.publicKey),
            secretKey: util.encodeBase64(encrypt.secretKey),
        },
        signing: {
            publicKey: util.encodeBase64(sign.publicKey),
            secretKey: util.encodeBase64(sign.secretKey),
        }
    }
}

export async function keyPairFromPassword({ nonce, password, signing = false }: { nonce: string, password: string, signing: boolean }): Promise<KeyPair> {
    const options = { N: 16384, r: 8, p: 1 }
    const buffer = await scrypt.scrypt(password, nonce, (nacl.box.secretKeyLength / 2), options)
    const seed = [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, '0'))
        .join('')

    const uint8Seed = util.decodeUTF8(seed)
    const uint8Keypair = signing ?
        nacl.sign.keyPair.fromSeed(uint8Seed) :
        nacl.box.keyPair.fromSecretKey(uint8Seed)

    return {
        publicKey: util.encodeBase64(uint8Keypair.publicKey),
        secretKey: util.encodeBase64(uint8Keypair.secretKey),
    }
}

export async function nonceAndKeyPairFromPassword({ password }: { password: string }): Promise<(KeyPair & { nonce: string})> {
    const nonce = util.encodeBase64(nacl.randomBytes(nacl.box.nonceLength))
    const encryption = await keyPairFromPassword({ nonce, password, signing: false })

    return {
        nonce,
        ...encryption,
    }
}

export function decrypt(encrypted: string, keyPair: KeyPair) {
    const secretKeyUint = util.decodeBase64(keyPair.secretKey)
    const messageAndNonce = util.decodeBase64(encrypted)
    const boxNonce = messageAndNonce.slice(0, nacl.box.nonceLength)
    const message = messageAndNonce.slice(
        nacl.box.nonceLength,
        messageAndNonce.length
    )
    const payload = nacl.secretbox.open(message, boxNonce, secretKeyUint)
    if (!payload) throw Error('invalid password')
    const payloadString = util.encodeUTF8(payload)
    return JSON.parse(payloadString)
}

export function encrypt(decrypted: object, keyPair) {
    const dataString = JSON.stringify(decrypted)
    const secreKeyUint = util.decodeBase64(keyPair.secretKey)
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const message = util.decodeUTF8(dataString)
    const box = nacl.secretbox(message, nonce, secreKeyUint)
    const encrypted = new Uint8Array(nonce.length + box.length)
    encrypted.set(nonce)
    encrypted.set(box, nonce.length)
    return util.encodeBase64(encrypted)
}
