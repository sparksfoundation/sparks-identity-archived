import nacl from 'tweetnacl'
import naclutil from 'tweetnacl-util'
import * as scrypt from 'scrypt-pbkdf'
import { Buffer } from 'buffer'

export async function keypairFromPassword({ nonce, password, type } : { nonce: string, password: string, type: string }) {
  const options = { N: 16384, r: 8, p: 1 }
  const naclType = type === 'box' ? nacl.box : nacl.sign
  const buffer = await scrypt.scrypt(password, nonce, (naclType.secretKeyLength / 2), options)
  const seed = [...new Uint8Array(buffer)]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')

  const uint8Seed = naclutil.decodeUTF8(seed)
  const uint8Keypair = naclType.keyPair.fromSecretKey(uint8Seed)

  return {
    publicKey: naclutil.encodeBase64(uint8Keypair.publicKey),
    secretKey: naclutil.encodeBase64(uint8Keypair.secretKey),
  }
}

export async function keypairsFromPassword({ nonce, password }: { nonce: string, password: string }) {
  return {
    encryption: await keypairFromPassword({ nonce, password, type: 'box' }),
    signing: await keypairFromPassword({ nonce, password, type: 'sign' }),
  }
}

export const secretbox = {
  encrypt({ data, secretKey } : { data: string, secretKey: string }) {
    const dataString = JSON.stringify(data)
    const secreKeyUint = naclutil.decodeBase64(secretKey)
    const nonce = nacl.randomBytes(nacl.box.nonceLength)
    const message = naclutil.decodeUTF8(dataString)
    const box = nacl.secretbox(message, nonce, secreKeyUint)
    const encrypted = new Uint8Array(nonce.length + box.length)
    encrypted.set(nonce)
    encrypted.set(box, nonce.length)
    return naclutil.encodeBase64(encrypted)
  },
  decrypt({ data, secretKey } : { data: string, secretKey: string }) {
    const secretKeyUint = naclutil.decodeBase64(secretKey)
    const messageAndNonce = naclutil.decodeBase64(data)
    const nonce = messageAndNonce.slice(0, nacl.box.nonceLength)
    const message = messageAndNonce.slice(
      nacl.box.nonceLength,
      messageAndNonce.length
    )
    const payload = nacl.secretbox.open(message, nonce, secretKeyUint)
    if (!payload) throw Error('invalid password')
    const payloadString = naclutil.encodeUTF8(payload)
    return JSON.parse(payloadString)
  },
}

export function randomNonce() {
  return naclutil.encodeBase64(nacl.randomBytes(nacl.box.nonceLength))
}

export function asciiToBase64(str : string) {
  return Buffer.from(str).toString('base64')
}

export function base64ToAscii(str : string) {
  return Buffer.from(str, 'base64').toString()
}