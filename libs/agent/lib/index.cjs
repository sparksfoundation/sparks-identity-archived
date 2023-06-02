"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }



var _chunkWMBHDRFCcjs = require('./chunk-WMBHDRFC.cjs');
var _identifier, _keyPairs, _keyEventLog, _credentialEventLog, _verificationEventLog, _transactionEventLog, _transportQueue, _connections;
var _tweetnacl = require('tweetnacl'); var _tweetnacl2 = _interopRequireDefault(_tweetnacl);
var _tweetnaclutil = require('tweetnacl-util'); var _tweetnaclutil2 = _interopRequireDefault(_tweetnaclutil);
var _blake3 = require('@noble/hashes/blake3');
var _forgejs = require('./forge.js');
class Identity {
  constructor({ keyPairs }) {
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _identifier, void 0);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _keyPairs, void 0);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _keyEventLog, []);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _credentialEventLog, []);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _verificationEventLog, []);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _transactionEventLog, []);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _transportQueue, []);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _connections, []);
    _chunkWMBHDRFCcjs.__privateSet.call(void 0, this, _keyPairs, keyPairs);
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
    _chunkWMBHDRFCcjs.__privateSet.call(void 0, this, _identifier, identifier);
    _chunkWMBHDRFCcjs.__privateSet.call(void 0, this, _keyPairs, keyPairs);
    _chunkWMBHDRFCcjs.__privateSet.call(void 0, this, _keyEventLog, keyEventLog);
    _chunkWMBHDRFCcjs.__privateSet.call(void 0, this, _credentialEventLog, credentialEventLog);
    _chunkWMBHDRFCcjs.__privateSet.call(void 0, this, _verificationEventLog, verificationEventLog);
    _chunkWMBHDRFCcjs.__privateSet.call(void 0, this, _transactionEventLog, transactionEventLog);
    _chunkWMBHDRFCcjs.__privateSet.call(void 0, this, _transportQueue, transportQueue);
    _chunkWMBHDRFCcjs.__privateSet.call(void 0, this, _connections, connections.map((connection) => {
      return connection.bind(this);
    }));
  }
  get identifier() {
    return _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _identifier);
  }
  get publicKeys() {
    return {
      encryption: _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyPairs).encryption.publicKey,
      signing: _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyPairs).signing.publicKey
    };
  }
  get keyIndex() {
    return _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog).length;
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
    if (_chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _identifier) || _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog).length) {
      throw Error("Identity already incepted");
    }
    if (!_optionalChain([witnesses, 'optionalAccess', _ => _.length])) {
      throw Error("Witness public key required for inception");
    }
    const publicSigningKey = _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyPairs).signing.publicKey;
    const identifier = `B${_chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyPairs).signing.publicKey.replace(/=$/, "")}`;
    const nextKeyHash = _tweetnaclutil2.default.encodeBase64(_blake3.blake3.call(void 0, _tweetnaclutil2.default.decodeBase64(nextKey)));
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
    const hashedEvent = _tweetnaclutil2.default.encodeBase64(_blake3.blake3.call(void 0, eventJSON));
    const signedEventHash = this.sign({ message: hashedEvent, detached: true });
    inceptionEvent.version = version;
    inceptionEvent.selfAddressingIdentifier = signedEventHash;
    _chunkWMBHDRFCcjs.__privateSet.call(void 0, this, _identifier, identifier);
    _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog).push(inceptionEvent);
  }
  rotate({ keyPairs, nextKey, witnesses }) {
    if (!_chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _identifier) || !_chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog).length) {
      throw Error("Identity not incepted yet");
    }
    if (!_optionalChain([witnesses, 'optionalAccess', _2 => _2.length])) {
      throw Error("Witness public key required for inception");
    }
    _chunkWMBHDRFCcjs.__privateSet.call(void 0, this, _keyPairs, { ...keyPairs });
    const oldKeyEvent = _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog)[_chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog).length - 1];
    const publicSigningKey = _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyPairs).signing.publicKey;
    const nextKeyHash = _tweetnaclutil2.default.encodeBase64(_blake3.blake3.call(void 0, _tweetnaclutil2.default.decodeBase64(nextKey)));
    const rotationEvent = {
      identifier: _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _identifier),
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
    const hashedEvent = _tweetnaclutil2.default.encodeBase64(_blake3.blake3.call(void 0, eventJSON));
    const signedEventHash = this.sign({ message: hashedEvent, detached: true });
    rotationEvent.version = version;
    rotationEvent.selfAddressingIdentifier = signedEventHash;
    _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog).push(rotationEvent);
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
    const uintMessage = _tweetnaclutil2.default.decodeUTF8(message);
    const uintSecretKey = _tweetnaclutil2.default.decodeBase64(_chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyPairs).signing.secretKey);
    const signature = detached ? _tweetnaclutil2.default.encodeBase64(_tweetnacl2.default.sign.detached(uintMessage, uintSecretKey)) : _tweetnaclutil2.default.encodeBase64(_tweetnacl2.default.sign(uintMessage, uintSecretKey));
    return signature;
  }
  verify({ publicKey, signature, message }) {
    if (!!message) {
      if (typeof message !== "string" && !message instanceof String) {
        message = _tweetnaclutil2.default.decodeUTF8(this.__parseJSON(message));
      }
      message = _tweetnaclutil2.default.decodeUTF8(message);
    }
    const uintSignature = _tweetnaclutil2.default.decodeBase64(signature);
    const uintPublicKey = _tweetnaclutil2.default.decodeBase64(publicKey);
    return message ? _tweetnacl2.default.sign.detached.verify(message, uintSignature, uintPublicKey) : _tweetnacl2.default.sign.open(uintSignature, uintPublicKey);
  }
  witness(event) {
  }
  debug() {
    return {
      identifier: _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _identifier),
      publicKey: this.publicKeys.signing,
      nextKeys: _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog)[_chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog).length - 1].nextKeys,
      keyEventLog: _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog)
    };
  }
  toJSON() {
    return {
      identifier: _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _identifier),
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
  salt = _forgejs.randomSalt.call(void 0, );
  keyPairs = await _forgejs.keyPairsFromPassword.call(void 0, { password, salt });
  identity = new Identity({ keyPairs });
  nextKeyPairs = await _forgejs.keyPairsFromPassword.call(void 0, { password, salt: salt + identity.keyIndex });
  nextKey = nextKeyPairs.signing.publicKey;
  console.log("our public keys:");
  console.log({ signing: keyPairs.signing.publicKey, encryption: keyPairs.encryption.publicKey }, "\n\n");
  console.log("lets incept our identity with a nextKey and witnesses");
  console.log("verifiers can choose to trust particular witnesses, or none at all");
  console.log("this means no friction for casual peer networks and high security for others");
  console.log("imagine a bank deduplicating and witnessing a subset of the network");
  console.log("----------------------------------------------------");
  identity.incept({ nextKey, witnesses: ["sparks_server_public_key"] });
  console.log("our identifier:", identity.identifier);
  console.log("our public signing key:", identity.publicKeys.signing);
  console.log("our public encryption key:", identity.publicKeys.encryption, "\n\n");
  console.log("lets rotate our keys with a nextKey and witnesses");
  console.log("imagine you want to upgrade to a more trusted witness");
  console.log("or maybe your keys got compromised and you need to disable this identity");
  console.log("you can rotate the keys without changing the identifier or losing history");
  console.log("----------------------------------------------------");
  keyPairs = await _forgejs.keyPairsFromPassword.call(void 0, { password, salt: salt + (identity.keyIndex - 1) });
  nextKeyPairs = await _forgejs.keyPairsFromPassword.call(void 0, { password, salt: salt + identity.keyIndex });
  nextKey = nextKeyPairs.signing.publicKey;
  await identity.rotate({ keyPairs, nextKey, witnesses: ["sparks_server_public_key"] });
  console.log("our identifier is the same:", identity.identifier);
  console.log("our new public signing key:", identity.publicKeys.signing);
  console.log("our new public encryption key:", identity.publicKeys.encryption, "\n\n");
  const newPassword = "new password";
  const newSalt = _forgejs.randomSalt.call(void 0, );
  console.log("lets change our password, for whatever reason");
  console.log("we need to rotate the keys twice to do this");
  console.log("why? to maintain the chain of trust we have to honor the");
  console.log("previous commitments to the nextKey which happened with the old password");
  console.log("----------------------------------------------------");
  keyPairs = await _forgejs.keyPairsFromPassword.call(void 0, { password, salt: salt + (identity.keyIndex - 1) });
  nextKeyPairs = await _forgejs.keyPairsFromPassword.call(void 0, { password: newPassword, salt: newSalt + identity.keyIndex });
  nextKey = nextKeyPairs.signing.publicKey;
  await identity.rotate({ keyPairs, nextKey, witnesses: ["sparks_server_public_key"] });
  keyPairs = await _forgejs.keyPairsFromPassword.call(void 0, { password: newPassword, salt: newSalt + (identity.keyIndex - 1) });
  nextKeyPairs = await _forgejs.keyPairsFromPassword.call(void 0, { password: newPassword, salt: newSalt + identity.keyIndex });
  nextKey = nextKeyPairs.signing.publicKey;
  await identity.rotate({ keyPairs, nextKey, witnesses: ["sparks_server_public_key"] });
  console.log("password updated!");
  console.log("our identifier is the same:", identity.identifier);
  console.log("our new public signing key:", identity.publicKeys.signing);
  console.log("our new public encryption key:", identity.publicKeys.encryption, "\n\n");
  console.log("let's verify out identities chain of events starting with event 0");
  console.log("each event is signed by the previous event's nextKey");
  console.log("and the event data is signed by the event's signing key");
  console.log("this means we can verify the chain of events and the data integrity at every step");
  console.log("we have the inception event, and three rotations to check");
  console.log("----------------------------------------------------");
  const events = identity.debug().keyEventLog;
  events.forEach((event, index) => {
    const { selfAddressingIdentifier, version, ...eventBody } = event;
    const message = _tweetnaclutil2.default.encodeBase64(_blake3.blake3.call(void 0, JSON.stringify(eventBody)));
    const dataInTact = identity.verify({ message, signature: selfAddressingIdentifier, publicKey: event.signingKeys[0] });
    console.log("event data trustworthy:", dataInTact);
    if (index > 0) {
      const keyCommittment = events[index - 1].nextKeys[0];
      const currenKey = _tweetnaclutil2.default.encodeBase64(_blake3.blake3.call(void 0, _tweetnaclutil2.default.decodeBase64(event.signingKeys[0])));
      const committmentValid = currenKey === keyCommittment;
      console.log("key commitment in tact:", committmentValid);
    }
  });
})();
