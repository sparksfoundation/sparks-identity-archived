import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import { RandomForge } from './types';

const signingKeyPair = async () => {
  const signing = nacl.sign.keyPair();
  return {
    publicKey: util.encodeBase64(signing.publicKey),
    secretKey: util.encodeBase64(signing.secretKey),
  };
};

const encryptionKeyPair = async () => {
  const encryption = nacl.box.keyPair();
  return {
    publicKey: util.encodeBase64(encryption.publicKey),
    secretKey: util.encodeBase64(encryption.secretKey),
  };
};

const keyPairs = async () => {
  return Promise.all([signingKeyPair(), encryptionKeyPair()]).then(([signing, encryption]) => {
    return {
      signing,
      encryption,
    };
  });
}

export default keyPairs as RandomForge;