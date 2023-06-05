import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import * as scrypt from 'scrypt-pbkdf';
import { PasswordForge } from './types';
import { blake3 } from '@noble/hashes/blake3';

const generateSalt = (identity) => {
  return util.encodeBase64(blake3(JSON.stringify(identity)));
}

const signingKeyPair = async ({ password, identity }) => {
  const options = { N: 16384, r: 8, p: 1 };
  const salt = generateSalt(identity)
  const buffer = await scrypt.scrypt(
    password,
    salt,
    nacl.box.secretKeyLength / 2,
    options,
  );
  const seed = [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');

  const uint8Seed = util.decodeUTF8(seed);
  const uint8Keypair = nacl.sign.keyPair.fromSeed(uint8Seed);

  return {
    publicKey: util.encodeBase64(uint8Keypair.publicKey),
    secretKey: util.encodeBase64(uint8Keypair.secretKey),
  };
};

const encryptionKeyPair = async ({ password, identity }) => {
  const options = { N: 16384, r: 8, p: 1 };
  const salt = generateSalt(identity)
  const buffer = await scrypt.scrypt(
    password,
    salt,
    nacl.box.secretKeyLength / 2,
    options,
  );
  const seed = [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');

  const uint8Seed = util.decodeUTF8(seed);
  const uint8Keypair = nacl.box.keyPair.fromSecretKey(uint8Seed);

  return {
    publicKey: util.encodeBase64(uint8Keypair.publicKey),
    secretKey: util.encodeBase64(uint8Keypair.secretKey),
  };
};

const keyPairs = async ({ password, identity = '' }) => {
  return Promise.all([signingKeyPair({ password, identity }), encryptionKeyPair({ password, identity })]).then(([signing, encryption]) => {
    return {
      signing,
      encryption,
    };
  });
}

export default keyPairs as PasswordForge;