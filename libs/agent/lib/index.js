import {
  __privateAdd,
  __privateGet,
  __privateSet
} from "./chunk-S6GDW532.js";
var _identifier, _keyPairs, _keyEventLog, _credentialEventLog, _verificationEventLog, _transactionEventLog, _transportQueue, _connections;
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { blake3 } from "@noble/hashes/blake3";
import { nonceAndKeyPairFromPassword, randomKeyPair } from "./helpers.js";
class Identity {
  constructor() {
    __privateAdd(this, _identifier, void 0);
    __privateAdd(this, _keyPairs, void 0);
    __privateAdd(this, _keyEventLog, []);
    __privateAdd(this, _credentialEventLog, []);
    __privateAdd(this, _verificationEventLog, []);
    __privateAdd(this, _transactionEventLog, []);
    __privateAdd(this, _transportQueue, []);
    __privateAdd(this, _connections, []);
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
  async __parseJSON(string) {
    return new Promise((resolve, reject) => {
      try {
        resolve(JSON.parse(string));
      } catch (e) {
        resolve(null);
      }
    });
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
    const parsed = await this.__parseJSON(decrypted);
    if (parsed)
      return this.__init(parsed);
  }
  async export() {
    const data = await this.__parseJSON(this);
    if (!data)
      throw Error("error exporting");
    const encrypted = await this.encrypt({ data });
    if (!encrypted)
      throw Error("error exporting");
    return encrypted;
  }
  incept({ noise = [], witness }) {
    if (__privateGet(this, _identifier) || __privateGet(this, _keyEventLog).length) {
      throw Error("Identity already incepted");
    }
    if (!witness) {
      throw Error("Witness public key required for inception");
    }
    const keyPairs = this.__randomKeyPairs({ noise: noise[0] });
    const publicSigningKey = keyPairs.signing.publicKey;
    const identifier = `B${keyPairs.signing.publicKey.replace(/=$/, "")}`;
    const nextKeyPairs = this.__randomKeyPairs({ noise: noise[1] });
    const nextSigningKey = util.encodeBase64(blake3(nextKeyPairs.signing.publicKey));
    const nextEncryptionKey = util.encodeBase64(blake3(nextKeyPairs.encryption.publicKey));
    const inceptionEvent = {
      version: "",
      identifier,
      eventIndex: "0",
      eventType: "inception",
      signatureThreshold: "1",
      signingKey: publicSigningKey,
      nextKeys: [nextSigningKey, nextEncryptionKey],
      witnessThreshold: "1",
      witnesses: [witness],
      configuration: {
        hashAlgorithm: "Blake3-256",
        keyCurves: { signing: "Ed25519", encryption: "Curve25519" },
        nextKeyCurves: { signing: "Ed25519", encryption: "Curve25519" }
      }
    };
    const inceptionEventJSON = JSON.stringify(inceptionEvent);
    const versionString = "KERI10JSON" + inceptionEventJSON.length.toString(16).padStart(6, "0") + "_";
    inceptionEvent.version = versionString;
    this.__init({
      identifier,
      keyPairs,
      keyEventLog: [inceptionEvent]
    });
  }
  rotate(args) {
    const { noise, witnesses } = args || {};
    if (!__privateGet(this, _identifier) || !__privateGet(this, _keyEventLog).length) {
      throw new Error("Identity not incepted yet");
    }
    const nextKeyPairs = this.__randomKeyPairs({ noise });
    const nextSigningKey = util.encodeBase64(blake3(nextKeyPairs.signing.publicKey));
    const nextEncryptionKey = util.encodeBase64(blake3(nextKeyPairs.encryption.publicKey));
    const rotationEvent = {
      version: "",
      identifier: __privateGet(this, _identifier),
      eventIndex: __privateGet(this, _keyEventLog).length.toString(),
      eventType: "rotation",
      signatureThreshold: "1",
      signingKeys: [__privateGet(this, _keyPairs).signing.publicKey],
      nextKeys: [nextSigningKey, nextEncryptionKey],
      witnessThreshold: "1",
      configuration: {
        signingCurve: "Ed25519",
        encryptionCurve: "Curve25519",
        hashAlgorithm: "Blake3-256",
        nextKeyCurves: ["Ed25519", "Curve25519"]
      }
    };
    const rotationEventJSON = JSON.stringify(rotationEvent);
    const versionString = `KERI10JSON${rotationEventJSON.length.toString(16).padStart(6, "0")}_`;
    rotationEvent.version = versionString;
    __privateGet(this, _keyEventLog).push(rotationEvent);
    if (!witnesses)
      return;
    witnesses.forEach((witness) => {
      const receipt = {
        eventIndex: rotationEvent.eventIndex,
        witnesses,
        signatures: []
      };
      __privateGet(this, _transportQueue).push(receipt);
    });
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
  sign({ message, detached }) {
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
  const { publicKey, secretKey, nonce } = await nonceAndKeyPairFromPassword({ password: "asdfasdfasdf" });
  const keyPairs = randomKeyPair();
  const identity = new Identity();
  identity.incept({ noise: ["tes", "s"], witness: "somekey" });
  console.log(JSON.stringify(identity, null, 2));
  identity.rotate();
  console.log(JSON.stringify(identity, null, 2));
})();
