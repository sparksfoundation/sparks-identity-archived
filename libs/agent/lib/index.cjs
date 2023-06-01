"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }



var _chunkWMBHDRFCcjs = require('./chunk-WMBHDRFC.cjs');
var _identifier, _keyPairs, _keyEventLog, _credentialEventLog, _verificationEventLog, _transactionEventLog, _transportQueue, _connections;
var _tweetnacl = require('tweetnacl'); var _tweetnacl2 = _interopRequireDefault(_tweetnacl);
var _tweetnaclutil = require('tweetnacl-util'); var _tweetnaclutil2 = _interopRequireDefault(_tweetnaclutil);
var _blake3 = require('@noble/hashes/blake3');
var _helpersjs = require('./helpers.js');
class Identity {
  constructor() {
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _identifier, void 0);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _keyPairs, void 0);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _keyEventLog, []);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _credentialEventLog, []);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _verificationEventLog, []);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _transactionEventLog, []);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _transportQueue, []);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _connections, []);
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
    if (_chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _identifier) || _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog).length) {
      throw Error("Identity already incepted");
    }
    if (!witness) {
      throw Error("Witness public key required for inception");
    }
    const keyPairs = this.__randomKeyPairs({ noise: noise[0] });
    const publicSigningKey = keyPairs.signing.publicKey;
    const identifier = `B${keyPairs.signing.publicKey.replace(/=$/, "")}`;
    const nextKeyPairs = this.__randomKeyPairs({ noise: noise[1] });
    const nextSigningKey = _tweetnaclutil2.default.encodeBase64(_blake3.blake3.call(void 0, nextKeyPairs.signing.publicKey));
    const nextEncryptionKey = _tweetnaclutil2.default.encodeBase64(_blake3.blake3.call(void 0, nextKeyPairs.encryption.publicKey));
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
    if (!_chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _identifier) || !_chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog).length) {
      throw new Error("Identity not incepted yet");
    }
    const nextKeyPairs = this.__randomKeyPairs({ noise });
    const nextSigningKey = _tweetnaclutil2.default.encodeBase64(_blake3.blake3.call(void 0, nextKeyPairs.signing.publicKey));
    const nextEncryptionKey = _tweetnaclutil2.default.encodeBase64(_blake3.blake3.call(void 0, nextKeyPairs.encryption.publicKey));
    const rotationEvent = {
      version: "",
      identifier: _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _identifier),
      eventIndex: _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog).length.toString(),
      eventType: "rotation",
      signatureThreshold: "1",
      signingKeys: [_chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyPairs).signing.publicKey],
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
    _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog).push(rotationEvent);
    if (!witnesses)
      return;
    witnesses.forEach((witness) => {
      const receipt = {
        eventIndex: rotationEvent.eventIndex,
        witnesses,
        signatures: []
      };
      _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _transportQueue).push(receipt);
    });
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
  sign({ message, detached }) {
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
  const { publicKey, secretKey, nonce } = await _helpersjs.nonceAndKeyPairFromPassword.call(void 0, { password: "asdfasdfasdf" });
  const keyPairs = _helpersjs.randomKeyPair.call(void 0, );
  const identity = new Identity();
  identity.incept({ noise: ["tes", "s"], witness: "somekey" });
  console.log(JSON.stringify(identity, null, 2));
  identity.rotate();
  console.log(JSON.stringify(identity, null, 2));
})();
