import nacl from 'tweetnacl';
import util from 'tweetnacl-util';
import { RandomForge } from './types';

const signingKeyPair = () => {
  const signing = nacl.sign.keyPair();
  return {
    publicKey: util.encodeBase64(signing.publicKey),
    secretKey: util.encodeBase64(signing.secretKey),
  };
};

const encryptionKeyPair = () => {
  const encryption = nacl.box.keyPair();
  return {
    publicKey: util.encodeBase64(encryption.publicKey),
    secretKey: util.encodeBase64(encryption.secretKey),
  };
};

const keyPairs = () => {
  return {
    signing: signingKeyPair(),
    encryption: encryptionKeyPair(),
  };
}

export default keyPairs as RandomForge;