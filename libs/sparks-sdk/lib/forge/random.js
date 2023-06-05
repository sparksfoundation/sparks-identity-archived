import "../chunk-S6GDW532.js";
import nacl from "tweetnacl";
import util from "tweetnacl-util";
const signingKeyPair = () => {
  const signing = nacl.sign.keyPair();
  return {
    publicKey: util.encodeBase64(signing.publicKey),
    secretKey: util.encodeBase64(signing.secretKey)
  };
};
const encryptionKeyPair = () => {
  const encryption = nacl.box.keyPair();
  return {
    publicKey: util.encodeBase64(encryption.publicKey),
    secretKey: util.encodeBase64(encryption.secretKey)
  };
};
const keyPairs = () => {
  return {
    signing: signingKeyPair(),
    encryption: encryptionKeyPair()
  };
};
var random_default = keyPairs;
export {
  random_default as default
};
