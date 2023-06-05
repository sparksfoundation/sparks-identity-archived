import {
  __privateAdd,
  __privateGet,
  __privateSet
} from "../chunk-GUTKD5ZG.js";
var _keyPairs, _identifier, _keyEventLog, _connections;
import util from "tweetnacl-util";
import { blake3 } from "@noble/hashes/blake3";
import nacl from "tweetnacl";
class Identity {
  constructor() {
    __privateAdd(this, _keyPairs, void 0);
    __privateAdd(this, _identifier, void 0);
    __privateAdd(this, _keyEventLog, void 0);
    __privateAdd(this, _connections, []);
  }
  __parseJSON(string) {
    if (typeof string !== "string")
      return null;
    try {
      return JSON.parse(string);
    } catch (e) {
      return null;
    }
  }
  get connections() {
    return __privateGet(this, _connections);
  }
  get identifier() {
    return __privateGet(this, _identifier);
  }
  get keyEventLog() {
    return __privateGet(this, _keyEventLog);
  }
  get publicKeys() {
    return {
      signing: __privateGet(this, _keyPairs).signing.publicKey,
      encryption: __privateGet(this, _keyPairs).encryption.publicKey
    };
  }
  incept({ keyPairs, nextKeyPairs, backers = [] }) {
    if (__privateGet(this, _identifier) || __privateGet(this, _keyEventLog)?.length) {
      throw Error("Identity already incepted");
    }
    if (!keyPairs) {
      throw new Error("Key pairs required for inception");
    }
    if (!nextKeyPairs) {
      throw new Error("Next signing key commitment required for inception");
    }
    __privateSet(this, _keyPairs, keyPairs);
    const identifier = `B${__privateGet(this, _keyPairs).signing.publicKey.replace(/=$/, "")}`;
    const publicSigningKey = __privateGet(this, _keyPairs).signing.publicKey;
    const nextKeyHash = util.encodeBase64(blake3(util.decodeBase64(nextKeyPairs.signing.publicKey)));
    const inceptionEvent = {
      identifier,
      eventIndex: "0",
      eventType: "inception",
      signingThreshold: "1",
      signingKeys: [publicSigningKey],
      nextKeyCommitments: [nextKeyHash],
      backerThreshold: "1",
      backers: [...backers]
    };
    const eventJSON = JSON.stringify(inceptionEvent);
    const version = "KERI10JSON" + eventJSON.length.toString(16).padStart(6, "0") + "_";
    const hashedEvent = util.encodeBase64(blake3(eventJSON));
    const signedEventHash = this.sign({ message: hashedEvent, detached: true });
    inceptionEvent.version = version;
    inceptionEvent.selfAddressingIdentifier = signedEventHash;
    __privateSet(this, _identifier, identifier);
    __privateSet(this, _keyEventLog, [inceptionEvent]);
  }
  rotate({ keyPairs, nextKeyPairs, backers = [] }) {
    if (!__privateGet(this, _identifier) || !__privateGet(this, _keyEventLog)?.length) {
      throw Error("Keys can not be rotated before inception");
    }
    if (!keyPairs) {
      throw new Error("Key pairs required for rotation");
    }
    if (!nextKeyPairs) {
      throw new Error("Next signing key committment required for rotation");
    }
    if (__privateGet(this, _keyEventLog)[__privateGet(this, _keyEventLog).length - 1].eventType === "destruction") {
      throw new Error("Keys can not be rotated after destruction");
    }
    __privateSet(this, _keyPairs, keyPairs);
    const oldKeyEvent = __privateGet(this, _keyEventLog)[__privateGet(this, _keyEventLog).length - 1];
    const publicSigningKey = __privateGet(this, _keyPairs).signing.publicKey;
    const nextKeyHash = util.encodeBase64(blake3(util.decodeBase64(nextKeyPairs.signing.publicKey)));
    const rotationEvent = {
      identifier: __privateGet(this, _identifier),
      eventIndex: (parseInt(oldKeyEvent.eventIndex) + 1).toString(),
      eventType: "rotation",
      signingThreshold: oldKeyEvent.signatureThreshold,
      signingKeys: [publicSigningKey],
      nextKeyCommitments: [nextKeyHash],
      backerThreshold: oldKeyEvent.backerThreshold,
      backers: [...backers]
    };
    const eventJSON = JSON.stringify(rotationEvent);
    const version = "KERI10JSON" + eventJSON.length.toString(16).padStart(6, "0") + "_";
    const hashedEvent = util.encodeBase64(blake3(eventJSON));
    const signedEventHash = this.sign({ message: hashedEvent, detached: true });
    rotationEvent.version = version;
    rotationEvent.selfAddressingIdentifier = signedEventHash;
    __privateGet(this, _keyEventLog).push(rotationEvent);
  }
  destroy(args) {
    const { backers = [] } = args || {};
    if (!__privateGet(this, _identifier) || !__privateGet(this, _keyEventLog)?.length) {
      throw Error("Identity does not exist");
    }
    const oldKeyEvent = __privateGet(this, _keyEventLog)[__privateGet(this, _keyEventLog).length - 1];
    const publicSigningKey = __privateGet(this, _keyPairs).signing.publicKey;
    const rotationEvent = {
      identifier: __privateGet(this, _identifier),
      eventIndex: (parseInt(oldKeyEvent.eventIndex) + 1).toString(),
      eventType: "destruction",
      signingThreshold: oldKeyEvent.signingThreshold,
      signingKeys: [publicSigningKey],
      nextKeyCommitments: [],
      backerThreshold: oldKeyEvent.backerThreshold,
      backers: [...backers]
    };
    const eventJSON = JSON.stringify(rotationEvent);
    const version = "KERI10JSON" + eventJSON.length.toString(16).padStart(6, "0") + "_";
    const hashedEvent = util.encodeBase64(blake3(eventJSON));
    const signedEventHash = this.sign({ message: hashedEvent, detached: true });
    rotationEvent.version = version;
    rotationEvent.selfAddressingIdentifier = signedEventHash;
    __privateGet(this, _keyEventLog).push(rotationEvent);
  }
  encrypt({ data, publicKey, sharedKey }) {
    if (!__privateGet(this, _keyPairs)) {
      throw new Error("No key pairs found, please import or incept identity");
    }
    const utfData = typeof data === "string" ? data : JSON.stringify(data);
    const uintData = util.decodeUTF8(utfData);
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    let box;
    if (publicKey) {
      const publicKeyUint = util.decodeBase64(publicKey);
      box = nacl.box(uintData, nonce, publicKeyUint, util.decodeBase64(__privateGet(this, _keyPairs).encryption.secretKey));
    } else if (sharedKey) {
      const sharedKeyUint = util.decodeBase64(sharedKey);
      box = nacl.box.after(uintData, nonce, sharedKeyUint);
    } else {
      const secreKeyUint = util.decodeBase64(__privateGet(this, _keyPairs).encryption.secretKey);
      box = nacl.secretbox(uintData, nonce, secreKeyUint);
    }
    const encrypted = new Uint8Array(nonce.length + box.length);
    encrypted.set(nonce);
    encrypted.set(box, nonce.length);
    return util.encodeBase64(encrypted);
  }
  decrypt({ data, publicKey, sharedKey }) {
    if (!__privateGet(this, _keyPairs)) {
      throw new Error("No key pairs found, please import or incept identity");
    }
    const uintData = util.decodeBase64(data);
    const nonce = uintData.slice(0, nacl.secretbox.nonceLength);
    const message = uintData.slice(nacl.secretbox.nonceLength, uintData.length);
    let decrypted;
    if (publicKey) {
      const publicKeyUint = util.decodeBase64(publicKey);
      decrypted = nacl.box.open(message, nonce, publicKeyUint, util.decodeBase64(__privateGet(this, _keyPairs).encryption.secretKey));
    } else if (sharedKey) {
      const sharedKeyUint = util.decodeBase64(sharedKey);
      decrypted = nacl.box.open.after(message, nonce, sharedKeyUint);
    } else {
      const secreKeyUint = util.decodeBase64(__privateGet(this, _keyPairs).encryption.secretKey);
      decrypted = nacl.secretbox.open(message, nonce, secreKeyUint);
    }
    if (!decrypted) {
      throw new Error("Could not decrypt message");
    }
    const utf8Result = util.encodeUTF8(decrypted);
    const result = this.__parseJSON(utf8Result) || utf8Result;
    return result;
  }
  sign({ message, detached = false }) {
    if (typeof message !== "string") {
      message = this.__parseJSON(message);
    }
    const uintMessage = util.decodeUTF8(message);
    const uintSecretKey = util.decodeBase64(__privateGet(this, _keyPairs).signing.secretKey);
    const signature = detached ? util.encodeBase64(nacl.sign.detached(uintMessage, uintSecretKey)) : util.encodeBase64(nacl.sign(uintMessage, uintSecretKey));
    return signature;
  }
  verify({ publicKey, signature, message }) {
    if (!!message) {
      if (typeof message !== "string") {
        message = util.decodeUTF8(this.__parseJSON(message));
      }
      message = util.decodeUTF8(message);
    }
    const uintSignature = util.decodeBase64(signature);
    const uintPublicKey = util.decodeBase64(publicKey);
    if (message) {
      return nacl.sign.detached.verify(message, uintSignature, uintPublicKey);
    } else {
      const uintResult = nacl.sign.open(uintSignature, uintPublicKey);
      if (uintResult === null)
        return uintResult;
      const utf8Result = util.encodeUTF8(uintResult);
      return this.__parseJSON(utf8Result) || utf8Result;
    }
  }
  addConnection(Connection) {
    return new Connection({
      keyPairs: __privateGet(this, _keyPairs),
      encrypt: this.encrypt.bind(this),
      decrypt: this.decrypt.bind(this),
      sign: this.sign.bind(this),
      verify: this.verify.bind(this)
    });
  }
  toJSON() {
    return {
      identifier: __privateGet(this, _identifier),
      keyEventLog: __privateGet(this, _keyEventLog)
    };
  }
}
_keyPairs = new WeakMap();
_identifier = new WeakMap();
_keyEventLog = new WeakMap();
_connections = new WeakMap();
export {
  Identity
};
