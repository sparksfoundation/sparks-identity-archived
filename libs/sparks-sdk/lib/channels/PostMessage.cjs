"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }




var _chunkSIAYTN4Tcjs = require('../chunk-SIAYTN4T.cjs');
var _keyPairs, _sharedKey, _listeners, _encrypt, _decrypt, _sign, _verify;
var _tweetnaclutil = require('tweetnacl-util'); var _tweetnaclutil2 = _interopRequireDefault(_tweetnaclutil);
var _tweetnacl = require('tweetnacl'); var _tweetnacl2 = _interopRequireDefault(_tweetnacl);
const _PostMessage = class {
  constructor({ keyPairs, encrypt, decrypt, sign, verify }) {
    _chunkSIAYTN4Tcjs.__privateAdd.call(void 0, this, _keyPairs, void 0);
    _chunkSIAYTN4Tcjs.__privateAdd.call(void 0, this, _sharedKey, void 0);
    _chunkSIAYTN4Tcjs.__privateAdd.call(void 0, this, _listeners, void 0);
    _chunkSIAYTN4Tcjs.__privateAdd.call(void 0, this, _encrypt, void 0);
    _chunkSIAYTN4Tcjs.__privateAdd.call(void 0, this, _decrypt, void 0);
    _chunkSIAYTN4Tcjs.__privateAdd.call(void 0, this, _sign, void 0);
    _chunkSIAYTN4Tcjs.__privateAdd.call(void 0, this, _verify, void 0);
    _chunkSIAYTN4Tcjs.__publicField.call(void 0, this, "target");
    _chunkSIAYTN4Tcjs.__publicField.call(void 0, this, "origin");
    _chunkSIAYTN4Tcjs.__publicField.call(void 0, this, "publicKeys");
    _chunkSIAYTN4Tcjs.__privateSet.call(void 0, this, _keyPairs, keyPairs);
    _chunkSIAYTN4Tcjs.__privateSet.call(void 0, this, _encrypt, encrypt);
    _chunkSIAYTN4Tcjs.__privateSet.call(void 0, this, _decrypt, decrypt);
    _chunkSIAYTN4Tcjs.__privateSet.call(void 0, this, _sign, sign);
    _chunkSIAYTN4Tcjs.__privateSet.call(void 0, this, _verify, verify);
    _chunkSIAYTN4Tcjs.__privateSet.call(void 0, this, _listeners, /* @__PURE__ */ new Map());
    window.addEventListener("beforeunload", async () => {
      await this.disconnect();
    });
  }
  static generateSharedKey({ keyPairs, publicKeys }) {
    const baseEncryptionPublicKey = _tweetnaclutil2.default.decodeBase64(publicKeys.encryption);
    const baseEncryptionSecretKey = _tweetnaclutil2.default.decodeBase64(keyPairs.encryption.secretKey);
    const uintSharedKey = _tweetnacl2.default.box.before(baseEncryptionPublicKey, baseEncryptionSecretKey);
    const baseSharedKey = _tweetnaclutil2.default.encodeBase64(uintSharedKey);
    return baseSharedKey;
  }
  accept({ url }) {
    return new Promise((resolve, reject) => {
      const origin = new URL(url).origin;
      const handler = (event) => {
        if (event.data.type !== "connect")
          return;
        if (event.origin !== origin)
          return;
        if (!event.data.publicKeys)
          return;
        event.source.postMessage({
          type: "connected",
          publicKeys: {
            signing: _chunkSIAYTN4Tcjs.__privateGet.call(void 0, this, _keyPairs).signing.publicKey,
            encryption: _chunkSIAYTN4Tcjs.__privateGet.call(void 0, this, _keyPairs).encryption.publicKey
          }
        }, event.origin);
        this.target = window.opener;
        this.origin = event.origin;
        this.publicKeys = event.data.publicKeys;
        _chunkSIAYTN4Tcjs.__privateSet.call(void 0, this, _sharedKey, _PostMessage.generateSharedKey({ keyPairs: _chunkSIAYTN4Tcjs.__privateGet.call(void 0, this, _keyPairs), publicKeys: this.publicKeys }));
        window.removeEventListener("message", handler);
        resolve(this);
      };
      window.addEventListener("message", handler);
    });
  }
  connect({ url }) {
    return new Promise((resolve, reject) => {
      const origin = new URL(url).origin;
      const target = window.open(url, origin);
      if (!target)
        return reject(new Error("Failed to open window"));
      const interval = setInterval(() => {
        target.postMessage({
          type: "connect",
          publicKeys: {
            signing: _chunkSIAYTN4Tcjs.__privateGet.call(void 0, this, _keyPairs).signing.publicKey,
            encryption: _chunkSIAYTN4Tcjs.__privateGet.call(void 0, this, _keyPairs).encryption.publicKey
          }
        }, origin);
      }, 1e3);
      const handler = (event) => {
        if (event.origin !== origin)
          return;
        if (event.data.type !== "connected")
          return;
        if (!event.data.publicKeys)
          return;
        this.target = target;
        this.origin = origin;
        this.publicKeys = event.data.publicKeys;
        _chunkSIAYTN4Tcjs.__privateSet.call(void 0, this, _sharedKey, _PostMessage.generateSharedKey({ keyPairs: _chunkSIAYTN4Tcjs.__privateGet.call(void 0, this, _keyPairs), publicKeys: this.publicKeys }));
        window.removeEventListener("message", handler);
        clearInterval(interval);
        resolve(this);
      };
      window.addEventListener("message", handler);
    });
  }
  disconnect() {
    return new Promise((resolve, reject) => {
      const handleDisconnect = (event) => {
        if (event.source === this.target && event.origin === this.origin && event.data === "disconnectConfirmation") {
          window.removeEventListener("message", handleDisconnect);
          resolve(true);
        }
      };
      window.addEventListener("message", handleDisconnect);
      this.target.postMessage({ type: "disconnect" }, this.origin);
    });
  }
  send(data) {
    if (!this.target)
      throw new Error("not connected yet");
    const ciphertext = _chunkSIAYTN4Tcjs.__privateGet.call(void 0, this, _encrypt).call(this, { data, sharedKey: _chunkSIAYTN4Tcjs.__privateGet.call(void 0, this, _sharedKey) });
    const signature = _chunkSIAYTN4Tcjs.__privateGet.call(void 0, this, _sign).call(this, { data: ciphertext, detached: true });
    return new Promise((resolve, reject) => {
      const handleMessage = (event) => {
        if (event.source === this.target && event.origin === this.origin && event.data === "messageConfirmation") {
          window.removeEventListener("message", handleMessage);
          resolve(true);
        }
      };
      window.addEventListener("message", handleMessage);
      this.target.postMessage({ type: "message", message: { ciphertext, signature } }, this.origin);
    });
  }
  on(eventType, callback) {
    const allowed = ["message", "connected", "disconnect"];
    if (!allowed.includes(eventType))
      return;
    const listener = (event) => {
      if (event.source === this.target && event.origin === this.origin && _optionalChain([event, 'access', _ => _.data, 'optionalAccess', _2 => _2.type]) === eventType) {
        const message = _optionalChain([event, 'access', _3 => _3.data, 'optionalAccess', _4 => _4.type]) === "message" ? _chunkSIAYTN4Tcjs.__privateGet.call(void 0, this, _decrypt).call(this, { data: event.data.message, sharedKey: _chunkSIAYTN4Tcjs.__privateGet.call(void 0, this, _sharedKey) }) : event.data.message;
        callback(message);
      }
    };
    _chunkSIAYTN4Tcjs.__privateGet.call(void 0, this, _listeners).set(callback, listener);
    window.addEventListener("message", listener);
  }
};
let PostMessage = _PostMessage;
_keyPairs = new WeakMap();
_sharedKey = new WeakMap();
_listeners = new WeakMap();
_encrypt = new WeakMap();
_decrypt = new WeakMap();
_sign = new WeakMap();
_verify = new WeakMap();


exports.PostMessage = PostMessage;
