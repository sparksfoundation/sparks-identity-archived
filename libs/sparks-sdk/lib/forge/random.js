import "../chunk-S6GDW532.js";
import nacl from "tweetnacl";
import util from "tweetnacl-util";
const signingKeyPair = async () => {
  const signing = nacl.sign.keyPair();
  return {
    publicKey: util.encodeBase64(signing.publicKey),
    secretKey: util.encodeBase64(signing.secretKey)
  };
};
const encryptionKeyPair = async () => {
  const encryption = nacl.box.keyPair();
  return {
    publicKey: util.encodeBase64(encryption.publicKey),
    secretKey: util.encodeBase64(encryption.secretKey)
  };
};
const keyPairs = async () => {
  return Promise.all([signingKeyPair(), encryptionKeyPair()]).then(([signing, encryption]) => {
    return {
      signing,
      encryption
    };
  });
};
var random_default = {
  signingKeyPair,
  encryptionKeyPair,
  keyPairs
};
export {
  random_default as default
};
