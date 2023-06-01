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
  __randomKeyPairs(args) {
    const seed = _optionalChain([args, 'optionalAccess', _ => _.noise]) ? _blake3.blake3.call(void 0, args.noise) : null;
    const uintKeyPairs = {
      signing: seed ? _tweetnacl2.default.sign.keyPair.fromSeed(seed) : _tweetnacl2.default.sign.keyPair(),
      encryption: seed ? _tweetnacl2.default.box.keyPair.fromSecretKey(seed) : _tweetnacl2.default.box.keyPair()
    };
    const keyPairs = {
      encryption: {
        publicKey: _tweetnaclutil2.default.encodeBase64(uintKeyPairs.encryption.publicKey),
        secretKey: _tweetnaclutil2.default.encodeBase64(uintKeyPairs.encryption.secretKey)
      },
      signing: {
        publicKey: _tweetnaclutil2.default.encodeBase64(uintKeyPairs.encryption.publicKey),
        secretKey: _tweetnaclutil2.default.encodeBase64(uintKeyPairs.encryption.secretKey)
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
    if (_chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _identifier) || _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog).length) {
      throw Error("Identity already incepted");
    }
    if (!_optionalChain([witnesses, 'optionalAccess', _2 => _2.length])) {
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
      signingKey: [publicSigningKey],
      nextKeys: [nextKeyHash],
      witnessThreshold: "1",
      witnesses: [witnesses],
      configuration: []
    };
    const eventJSON = JSON.stringify(inceptionEvent);
    const version = "KERI10JSON" + eventJSON.length.toString(16).padStart(6, "0") + "_";
    const hashedEvent = _tweetnaclutil2.default.encodeBase64(_blake3.blake3.call(void 0, eventJSON));
    const signedEventHash = this.sign({ message: hashedEvent });
    inceptionEvent.version = version;
    inceptionEvent.selfAddressingIdentifier = signedEventHash;
    _chunkWMBHDRFCcjs.__privateSet.call(void 0, this, _identifier, identifier);
    _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog).push(inceptionEvent);
  }
  rotate({ keyPairs, nextKey, witnesses }) {
    if (!_chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _identifier) || !_chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog).length) {
      throw Error("Identity not incepted yet");
    }
    if (!_optionalChain([witnesses, 'optionalAccess', _3 => _3.length])) {
      throw Error("Witness public key required for inception");
    }
    const oldKeyEvent = _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog)[_chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog).length - 1];
    _chunkWMBHDRFCcjs.__privateSet.call(void 0, this, _keyPairs, { ...keyPairs });
    const publicSigningKey = _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyPairs).signing.publicKey;
    const nextKeyHash = _tweetnaclutil2.default.encodeBase64(_blake3.blake3.call(void 0, _tweetnaclutil2.default.decodeBase64(nextKey)));
    const rotationEvent = {
      identifier: _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _identifier),
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
    const hashedEvent = _tweetnaclutil2.default.encodeBase64(_blake3.blake3.call(void 0, eventJSON));
    const signedEventHash = this.sign({ message: hashedEvent });
    rotationEvent.version = version;
    rotationEvent.selfAddressingIdentifier = signedEventHash;
    console.log(rotationEvent);
    _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog).push(rotationEvent);
  }
  destroy() {
  }
  encrypt({ data, publicKey, sharedKey }) {
    console.log(_chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyPairs));
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
  verify({ message, signature, publicKey }) {
  }
  witness(event) {
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
  const password = "test";
  const salt = _forgejs.randomSalt.call(void 0, );
  const keyPairs = await _forgejs.keyPairsFromPassword.call(void 0, { password, salt });
  const identity = new Identity({ keyPairs });
  const nextKeyPairs = await _forgejs.keyPairsFromPassword.call(void 0, { password, salt: salt + identity.keyIndex });
  const nextKey = nextKeyPairs.signing.publicKey;
  identity.incept({ nextKey, witnesses: ["sparks_server_public_key"] });
  console.log(JSON.stringify(identity, null, 2));
  const replaceWithkeyPairs = await _forgejs.keyPairsFromPassword.call(void 0, { password, salt: salt + identity.keyIndex });
  const newNextKeyPair = await _forgejs.signingKeysFromPassword.call(void 0, { password, salt: salt + identity.keyIndex + 1 });
  const newNextKey = newNextKeyPair.publicKey;
  await identity.rotate({ keyPairs: replaceWithkeyPairs, nextKey: newNextKey, witnesses: ["sparks_server_public_key"] });
  console.log(JSON.stringify(identity, null, 2));
})();
