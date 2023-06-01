"use strict";



var _chunkWMBHDRFCcjs = require('./chunk-WMBHDRFC.cjs');
var _identifier, _keyPairs, _keyEventLog, _credentialEventLog, _verificationEventLog, _transactionEventLog, _connections, _receiptQueue;
var _helpersjs = require('./helpers.js');
class Identity {
  constructor({ keyPairs }) {
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _identifier, void 0);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _keyPairs, void 0);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _keyEventLog, void 0);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _credentialEventLog, void 0);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _verificationEventLog, void 0);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _transactionEventLog, void 0);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _connections, void 0);
    _chunkWMBHDRFCcjs.__privateAdd.call(void 0, this, _receiptQueue, void 0);
    _chunkWMBHDRFCcjs.__privateSet.call(void 0, this, _keyPairs, keyPairs);
  }
  __init({
    identifier,
    keyEventLog = [],
    credentialEventLog = [],
    verificationEventLog = [],
    transactionEventLog = [],
    connections = []
  }) {
    _chunkWMBHDRFCcjs.__privateSet.call(void 0, this, _identifier, identifier);
    _chunkWMBHDRFCcjs.__privateSet.call(void 0, this, _keyEventLog, keyEventLog);
    _chunkWMBHDRFCcjs.__privateSet.call(void 0, this, _credentialEventLog, credentialEventLog);
    _chunkWMBHDRFCcjs.__privateSet.call(void 0, this, _verificationEventLog, verificationEventLog);
    _chunkWMBHDRFCcjs.__privateSet.call(void 0, this, _transactionEventLog, transactionEventLog);
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
  incept({ witness }) {
    if (_chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _identifier) || _chunkWMBHDRFCcjs.__privateGet.call(void 0, this, _keyEventLog).length) {
      throw Error("identity already incepted");
    }
    const icp = {};
    const identifier = `D${this.publicKeys.signing}--minus padding`;
  }
  rotate() {
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
_connections = new WeakMap();
_receiptQueue = new WeakMap();
(async function test() {
  const { publicKey, secretKey, nonce } = await _helpersjs.nonceAndKeyPairFromPassword.call(void 0, { password: "asdfasdfasdf" });
  const keyPairs = _helpersjs.randomKeyPair.call(void 0, );
  const identity = new Identity({ keyPairs });
})();
