import {
  __privateAdd,
  __privateGet,
  __privateSet
} from "./chunk-S6GDW532.js";
var _identifier, _keyPairs, _keyEventLog, _credentialEventLog, _verificationEventLog, _transactionEventLog, _transportQueue, _connections;
import nacl from "tweetnacl";
import util from "tweetnacl-util";
import { blake3 } from "@noble/hashes/blake3";
import { keyPairsFromPassword, randomSalt } from "./forge.js";
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
      signingKeys: [publicSigningKey],
      nextKeys: [nextKeyHash],
      witnessThreshold: "1",
      witnesses: [witnesses]
    };
    const eventJSON = JSON.stringify(inceptionEvent);
    const version = "KERI10JSON" + eventJSON.length.toString(16).padStart(6, "0") + "_";
    const hashedEvent = util.encodeBase64(blake3(eventJSON));
    const signedEventHash = this.sign({ message: hashedEvent, detached: true });
    inceptionEvent.version = version;
    inceptionEvent.selfAddressingIdentifier = signedEventHash;
    __privateSet(this, _identifier, identifier);
    __privateGet(this, _keyEventLog).push(inceptionEvent);
  }
  rotate({
    keyPairs,
    nextKey,
    witnesses
  }) {
    if (!__privateGet(this, _identifier) || !__privateGet(this, _keyEventLog).length) {
      throw Error("Identity not incepted yet");
    }
    if (!witnesses?.length) {
      throw Error("Witness public key required for inception");
    }
    __privateSet(this, _keyPairs, { ...keyPairs });
    const oldKeyEvent = __privateGet(this, _keyEventLog)[__privateGet(this, _keyEventLog).length - 1];
    const publicSigningKey = __privateGet(this, _keyPairs).signing.publicKey;
    const nextKeyHash = util.encodeBase64(blake3(util.decodeBase64(nextKey)));
    const rotationEvent = {
      identifier: __privateGet(this, _identifier),
      eventIndex: (parseInt(oldKeyEvent.eventIndex) + 1).toString(),
      eventType: "rotation",
      signatureThreshold: oldKeyEvent.signatureThreshold,
      signingKeys: [publicSigningKey],
      nextKeys: [nextKeyHash],
      witnessThreshold: oldKeyEvent.witnessThreshold,
      witnesses: [...oldKeyEvent.witnesses]
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
  encrypt({
    data,
    publicKey,
    sharedKey
  }) {
    return "";
  }
  decrypt({
    data,
    publicKey,
    sharedKey
  }) {
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
    return message ? nacl.sign.detached.verify(message, uintSignature, uintPublicKey) : nacl.sign.open(uintSignature, uintPublicKey);
  }
  witness(event) {
  }
  debug() {
    return {
      identifier: __privateGet(this, _identifier),
      publicKey: this.publicKeys.signing,
      nextKeys: __privateGet(this, _keyEventLog)[__privateGet(this, _keyEventLog).length - 1].nextKeys,
      keyEventLog: __privateGet(this, _keyEventLog)
    };
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
  let password, salt, keyPairs, nextKeyPairs, nextKey, identity;
  console.log("\n\nlets derive some keyPairs from a password and salt.");
  console.log("we can use other methods like ephemeral keys, hardware");
  console.log("wallet or even things like biometrics in the future");
  console.log("----------------------------------------------------");
  password = "test";
  salt = randomSalt();
  keyPairs = await keyPairsFromPassword({ password, salt });
  identity = new Identity({ keyPairs });
  nextKeyPairs = await keyPairsFromPassword({ password, salt: salt + identity.keyIndex });
  nextKey = nextKeyPairs.signing.publicKey;
  console.log("our public keys:");
  console.log(
    { signing: keyPairs.signing.publicKey, encryption: keyPairs.encryption.publicKey },
    "\n\n"
  );
  console.log("lets incept our identity with a nextKey and witnesses");
  console.log("verifiers can choose to trust particular witnesses, or none at all");
  console.log(
    "this means no friction for casual peer networks and high security for others"
  );
  console.log("imagine a bank deduplicating and witnessing a subset of the network");
  console.log("----------------------------------------------------");
  identity.incept({ nextKey, witnesses: ["sparks_server_public_key"] });
  console.log("our identifier:", identity.identifier);
  console.log("our public signing key:", identity.publicKeys.signing);
  console.log("our public encryption key:", identity.publicKeys.encryption, "\n\n");
  console.log("lets rotate our keys with a nextKey and witnesses");
  console.log("imagine you want to upgrade to a more trusted witness");
  console.log("or maybe your keys got compromised and you need to disable this identity");
  console.log(
    "you can rotate the keys without changing the identifier or losing history"
  );
  console.log("----------------------------------------------------");
  keyPairs = await keyPairsFromPassword({
    password,
    salt: salt + (identity.keyIndex - 1)
  });
  nextKeyPairs = await keyPairsFromPassword({ password, salt: salt + identity.keyIndex });
  nextKey = nextKeyPairs.signing.publicKey;
  await identity.rotate({ keyPairs, nextKey, witnesses: ["sparks_server_public_key"] });
  console.log("our identifier is the same:", identity.identifier);
  console.log("our new public signing key:", identity.publicKeys.signing);
  console.log("our new public encryption key:", identity.publicKeys.encryption, "\n\n");
  const newPassword = "new password";
  const newSalt = randomSalt();
  console.log("lets change our password, for whatever reason");
  console.log("we need to rotate the keys twice to do this");
  console.log("why? to maintain the chain of trust we have to honor the");
  console.log("previous commitments to the nextKey which happened with the old password");
  console.log("----------------------------------------------------");
  keyPairs = await keyPairsFromPassword({
    password,
    salt: salt + (identity.keyIndex - 1)
  });
  nextKeyPairs = await keyPairsFromPassword({
    password: newPassword,
    salt: newSalt + identity.keyIndex
  });
  nextKey = nextKeyPairs.signing.publicKey;
  await identity.rotate({ keyPairs, nextKey, witnesses: ["sparks_server_public_key"] });
  keyPairs = await keyPairsFromPassword({
    password: newPassword,
    salt: newSalt + (identity.keyIndex - 1)
  });
  nextKeyPairs = await keyPairsFromPassword({
    password: newPassword,
    salt: newSalt + identity.keyIndex
  });
  nextKey = nextKeyPairs.signing.publicKey;
  await identity.rotate({ keyPairs, nextKey, witnesses: ["sparks_server_public_key"] });
  console.log("password updated!");
  console.log("our identifier is the same:", identity.identifier);
  console.log("our new public signing key:", identity.publicKeys.signing);
  console.log("our new public encryption key:", identity.publicKeys.encryption, "\n\n");
  console.log("let's verify out identities chain of events starting with event 0");
  console.log("each event is signed by the previous event's nextKey");
  console.log("and the event data is signed by the event's signing key");
  console.log(
    "this means we can verify the chain of events and the data integrity at every step"
  );
  console.log("we have the inception event, and three rotations to check");
  console.log("----------------------------------------------------");
  const events = identity.debug().keyEventLog;
  events.forEach((event, index) => {
    const { selfAddressingIdentifier, version, ...eventBody } = event;
    const message = util.encodeBase64(blake3(JSON.stringify(eventBody)));
    const dataInTact = identity.verify({
      message,
      signature: selfAddressingIdentifier,
      publicKey: event.signingKeys[0]
    });
    console.log("event data trustworthy:", dataInTact);
    if (index > 0) {
      const keyCommittment = events[index - 1].nextKeys[0];
      const currenKey = util.encodeBase64(
        blake3(util.decodeBase64(event.signingKeys[0]))
      );
      const committmentValid = currenKey === keyCommittment;
      console.log("key commitment in tact:", committmentValid);
    }
  });
})();
