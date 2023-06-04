import {
  __privateAdd,
  __privateGet,
  __privateSet
} from "../chunk-S6GDW532.js";
var _keyPairs, _identifier, _keyEventLog;
import util from "tweetnacl-util";
import { blake3 } from "@noble/hashes/blake3";
import nacl from "tweetnacl";
class Identity {
  constructor() {
    __privateAdd(this, _keyPairs, void 0);
    __privateAdd(this, _identifier, void 0);
    __privateAdd(this, _keyEventLog, void 0);
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
  toJSON() {
    return {
      identifier: __privateGet(this, _identifier),
      keyEventLog: __privateGet(this, _keyEventLog)
    };
  }
  get identifier() {
    return __privateGet(this, _identifier);
  }
  get keyEventLog() {
    return __privateGet(this, _keyEventLog);
  }
  incept(args) {
    let { keyPairs, nextSigningKey, backers = [] } = args || {};
    if (!keyPairs) {
      throw new Error("Key pairs required for inception");
    }
    if (!nextSigningKey) {
      throw new Error("Next signing key commitment required for inception");
    }
    __privateSet(this, _keyPairs, keyPairs);
    const identifier = `B${__privateGet(this, _keyPairs).signing.publicKey.replace(/=$/, "")}`;
    const publicSigningKey = __privateGet(this, _keyPairs).signing.publicKey;
    const nextKeyHash = util.encodeBase64(blake3(util.decodeBase64(nextSigningKey)));
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
  rotate(args) {
    let { keyPairs, nextSigningKey, backers = [] } = args || {};
    if (!__privateGet(this, _identifier) || !__privateGet(this, _keyEventLog).length) {
      throw Error("Keys can not be rotated before inception");
    }
    if (!keyPairs) {
      throw new Error("Key pairs required for rotation");
    }
    if (!nextSigningKey) {
      throw new Error("Next signing key committment required for rotation");
    }
    __privateSet(this, _keyPairs, keyPairs);
    const oldKeyEvent = __privateGet(this, _keyEventLog)[__privateGet(this, _keyEventLog).length - 1];
    const publicSigningKey = __privateGet(this, _keyPairs).signing.publicKey;
    const nextKeyHash = util.encodeBase64(blake3(util.decodeBase64(nextSigningKey)));
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
  destroy() {
  }
  encrypt({ data, publicKey, sharedKey }) {
    return "";
  }
  decrypt({ data, publicKey, sharedKey }) {
    return "";
  }
  sign({ message, detached = false }) {
    if (typeof message !== "string" && !(message instanceof String)) {
      message = this.__parseJSON(message);
    }
    const uintMessage = util.decodeUTF8(message);
    const uintSecretKey = util.decodeBase64(__privateGet(this, _keyPairs).signing.secretKey);
    const signature = detached ? util.encodeBase64(nacl.sign.detached(uintMessage, uintSecretKey)) : util.encodeBase64(nacl.sign(uintMessage, uintSecretKey));
    return signature;
  }
  verify({ publicKey, signature, message }) {
    if (!!message) {
      if (typeof message !== "string" && !message instanceof String) {
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
}
_keyPairs = new WeakMap();
_identifier = new WeakMap();
_keyEventLog = new WeakMap();
export {
  Identity
};
