import {
  __privateAdd,
  __privateGet,
  __privateSet
} from "./chunk-S6GDW532.js";
var _identifier, _keyPairs, _keyEventLog, _credentialEventLog, _verificationEventLog, _transactionEventLog, _transportQueue, _connections;
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { blake3 } from "@noble/hashes/blake3";
import { keyPairsFromPassword, randomSalt, signingKeysFromPassword } from "./forge.js";
class Identity {
  constructor({ keyPairs }) {
    __privateAdd(this, _identifier, void 0);
    __privateAdd(this, _keyPairs, void 0);
    __privateAdd(this, _keyEventLog, []);
    __privateAdd(this, _credentialEventLog, []);
    __privateAdd(this, _verificationEventLog, []);
    __privateAdd(this, _transactionEventLog, []);
    __privateAdd(this, _transportQueue, []);
    __privateAdd(this, _connections, []);
    __privateSet(this, _keyPairs, keyPairs);
  }
  __init({
    identifier,
    keyPairs,
    keyEventLog = [],
    credentialEventLog = [],
    verificationEventLog = [],
    transactionEventLog = [],
    transportQueue = [],
    connections = []
  }) {
    __privateSet(this, _identifier, identifier);
    __privateSet(this, _keyPairs, keyPairs);
    __privateSet(this, _keyEventLog, keyEventLog);
    __privateSet(this, _credentialEventLog, credentialEventLog);
    __privateSet(this, _verificationEventLog, verificationEventLog);
    __privateSet(this, _transactionEventLog, transactionEventLog);
    __privateSet(this, _transportQueue, transportQueue);
    __privateSet(this, _connections, connections.map((connection) => {
      return connection.bind(this);
    }));
  }
  get identifier() {
    return __privateGet(this, _identifier);
  }
  get publicKeys() {
    return {
      encryption: __privateGet(this, _keyPairs).encryption.publicKey,
      signing: __privateGet(this, _keyPairs).signing.publicKey
    };
  }
  get keyIndex() {
    return __privateGet(this, _keyEventLog).length;
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
  __randomKeyPairs(args) {
    const seed = args?.noise ? blake3(args.noise) : null;
    const uintKeyPairs = {
      signing: seed ? nacl.sign.keyPair.fromSeed(seed) : nacl.sign.keyPair(),
      encryption: seed ? nacl.box.keyPair.fromSecretKey(seed) : nacl.box.keyPair()
    };
    const keyPairs = {
      encryption: {
        publicKey: util.encodeBase64(uintKeyPairs.encryption.publicKey),
        secretKey: util.encodeBase64(uintKeyPairs.encryption.secretKey)
      },
      signing: {
        publicKey: util.encodeBase64(uintKeyPairs.encryption.publicKey),
        secretKey: util.encodeBase64(uintKeyPairs.encryption.secretKey)
      }
    };
    return keyPairs;
  }
  async import({ data }) {
    const isString = typeof data === "string" || data instanceof String;
    if (!isString)
      throw Error("can only import encrypted identity");
    const decrypted = await this.decrypt({ data });
    const parsed = this.__parseJSON(decrypted);
    if (parsed)
      return this.__init(parsed);
  }
  async export() {
    const data = this.__parseJSON(this);
    if (!data)
      throw Error("error exporting");
    const encrypted = await this.encrypt({ data });
    if (!encrypted)
      throw Error("error exporting");
    return encrypted;
  }
  incept({ nextKey, witnesses }) {
    if (__privateGet(this, _identifier) || __privateGet(this, _keyEventLog).length) {
      throw Error("Identity already incepted");
    }
    if (!witnesses?.length) {
      throw Error("Witness public key required for inception");
    }
    const publicSigningKey = __privateGet(this, _keyPairs).signing.publicKey;
    const identifier = `B${__privateGet(this, _keyPairs).signing.publicKey.replace(/=$/, "")}`;
    const nextKeyHash = util.encodeBase64(blake3(util.decodeBase64(nextKey)));
    const inceptionEvent = {
      identifier,
      eventIndex: "0",
      eventType: "inception",
      signatureThreshold: "1",
      signingKey: [publicSigningKey],
      nextKeys: [nextKeyHash],
      witnessThreshold: "1",
      witnesses: [witnesses],
      configuration: []
    };
    const eventJSON = JSON.stringify(inceptionEvent);
    const version = "KERI10JSON" + eventJSON.length.toString(16).padStart(6, "0") + "_";
    const hashedEvent = util.encodeBase64(blake3(eventJSON));
    const signedEventHash = this.sign({ message: hashedEvent });
    inceptionEvent.version = version;
    inceptionEvent.selfAddressingIdentifier = signedEventHash;
    __privateSet(this, _identifier, identifier);
    __privateGet(this, _keyEventLog).push(inceptionEvent);
  }
  rotate({ keyPairs, nextKey, witnesses }) {
    if (!__privateGet(this, _identifier) || !__privateGet(this, _keyEventLog).length) {
      throw Error("Identity not incepted yet");
    }
    if (!witnesses?.length) {
      throw Error("Witness public key required for inception");
    }
    const oldKeyEvent = __privateGet(this, _keyEventLog)[__privateGet(this, _keyEventLog).length - 1];
    __privateSet(this, _keyPairs, { ...keyPairs });
    const publicSigningKey = __privateGet(this, _keyPairs).signing.publicKey;
    const nextKeyHash = util.encodeBase64(blake3(util.decodeBase64(nextKey)));
    const rotationEvent = {
      identifier: __privateGet(this, _identifier),
      eventIndex: (parseInt(oldKeyEvent.eventIndex) + 1).toString(),
      eventType: "rotation",
      signatureThreshold: oldKeyEvent.signatureThreshold,
      signingKey: [publicSigningKey],
      nextKeys: [nextKeyHash],
      witnessThreshold: oldKeyEvent.witnessThreshold,
      witnesses: [...oldKeyEvent.witnesses],
      configuration: Array.isArray(oldKeyEvent.configuration) ? [...oldKeyEvent.configuration] : { ...oldKeyEvent.configuration }
    };
    const eventJSON = JSON.stringify(rotationEvent);
    const version = "KERI10JSON" + eventJSON.length.toString(16).padStart(6, "0") + "_";
    const hashedEvent = util.encodeBase64(blake3(eventJSON));
    const signedEventHash = this.sign({ message: hashedEvent });
    rotationEvent.version = version;
    rotationEvent.selfAddressingIdentifier = signedEventHash;
    console.log(rotationEvent);
    __privateGet(this, _keyEventLog).push(rotationEvent);
  }
  destroy() {
  }
  encrypt({ data, publicKey, sharedKey }) {
    console.log(__privateGet(this, _keyPairs));
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
  verify({ message, signature, publicKey }) {
  }
  witness(event) {
  }
  toJSON() {
    return {
      identifier: __privateGet(this, _identifier),
      publicKeys: this.publicKeys
    };
  }
}
_identifier = new WeakMap();
_keyPairs = new WeakMap();
_keyEventLog = new WeakMap();
_credentialEventLog = new WeakMap();
_verificationEventLog = new WeakMap();
_transactionEventLog = new WeakMap();
_transportQueue = new WeakMap();
_connections = new WeakMap();
(async function test() {
  const password = "test";
  const salt = randomSalt();
  const keyPairs = await keyPairsFromPassword({ password, salt });
  const identity = new Identity({ keyPairs });
  const nextKeyPairs = await keyPairsFromPassword({ password, salt: salt + identity.keyIndex });
  const nextKey = nextKeyPairs.signing.publicKey;
  identity.incept({ nextKey, witnesses: ["sparks_server_public_key"] });
  console.log(JSON.stringify(identity, null, 2));
  const replaceWithkeyPairs = await keyPairsFromPassword({ password, salt: salt + identity.keyIndex });
  const newNextKeyPair = await signingKeysFromPassword({ password, salt: salt + identity.keyIndex + 1 });
  const newNextKey = newNextKeyPair.publicKey;
  await identity.rotate({ keyPairs: replaceWithkeyPairs, nextKey: newNextKey, witnesses: ["sparks_server_public_key"] });
  console.log(JSON.stringify(identity, null, 2));
})();
