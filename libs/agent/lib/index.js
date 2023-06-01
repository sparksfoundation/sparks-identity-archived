import {
  __privateAdd,
  __privateGet,
  __privateSet
} from "./chunk-S6GDW532.js";
var _identifier, _keyPairs, _keyEventLog, _credentialEventLog, _verificationEventLog, _transactionEventLog, _connections, _receiptQueue;
import { nonceAndKeyPairFromPassword, randomKeyPair } from "./helpers.js";
class Identity {
  constructor({ keyPairs }) {
    __privateAdd(this, _identifier, void 0);
    __privateAdd(this, _keyPairs, void 0);
    __privateAdd(this, _keyEventLog, void 0);
    __privateAdd(this, _credentialEventLog, void 0);
    __privateAdd(this, _verificationEventLog, void 0);
    __privateAdd(this, _transactionEventLog, void 0);
    __privateAdd(this, _connections, void 0);
    __privateAdd(this, _receiptQueue, void 0);
    __privateSet(this, _keyPairs, keyPairs);
  }
  __init({
    identifier,
    keyEventLog = [],
    credentialEventLog = [],
    verificationEventLog = [],
    transactionEventLog = [],
    connections = []
  }) {
    __privateSet(this, _identifier, identifier);
    __privateSet(this, _keyEventLog, keyEventLog);
    __privateSet(this, _credentialEventLog, credentialEventLog);
    __privateSet(this, _verificationEventLog, verificationEventLog);
    __privateSet(this, _transactionEventLog, transactionEventLog);
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
    if (__privateGet(this, _identifier) || __privateGet(this, _keyEventLog).length) {
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
_connections = new WeakMap();
_receiptQueue = new WeakMap();
(async function test() {
  const { publicKey, secretKey, nonce } = await nonceAndKeyPairFromPassword({ password: "asdfasdfasdf" });
  const keyPairs = randomKeyPair();
  const identity = new Identity({ keyPairs });
})();
