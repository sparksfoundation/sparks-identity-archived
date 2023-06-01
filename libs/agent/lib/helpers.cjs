"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }require('./chunk-WMBHDRFC.cjs');
var _tweetnacl = require('tweetnacl'); var _tweetnacl2 = _interopRequireDefault(_tweetnacl);
var _tweetnaclutil = require('tweetnacl-util'); var _tweetnaclutil2 = _interopRequireDefault(_tweetnaclutil);
var _scryptpbkdf = require('scrypt-pbkdf'); var scrypt = _interopRequireWildcard(_scryptpbkdf);
function randomKeyPair() {
  const encrypt2 = _tweetnacl2.default.box.keyPair();
  const sign = _tweetnacl2.default.sign.keyPair();
  return {
    encryption: {
      publicKey: _tweetnaclutil2.default.encodeBase64(encrypt2.publicKey),
      secretKey: _tweetnaclutil2.default.encodeBase64(encrypt2.secretKey)
    },
    signing: {
      publicKey: _tweetnaclutil2.default.encodeBase64(sign.publicKey),
      secretKey: _tweetnaclutil2.default.encodeBase64(sign.secretKey)
    }
  };
}
async function keyPairFromPassword({ nonce, password, signing = false }) {
  const options = { N: 16384, r: 8, p: 1 };
  const buffer = await scrypt.scrypt(password, nonce, _tweetnacl2.default.box.secretKeyLength / 2, options);
  const seed = [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
  const uint8Seed = _tweetnaclutil2.default.decodeUTF8(seed);
  const uint8Keypair = signing ? _tweetnacl2.default.sign.keyPair.fromSeed(uint8Seed) : _tweetnacl2.default.box.keyPair.fromSecretKey(uint8Seed);
  return {
    publicKey: _tweetnaclutil2.default.encodeBase64(uint8Keypair.publicKey),
    secretKey: _tweetnaclutil2.default.encodeBase64(uint8Keypair.secretKey)
  };
}
async function nonceAndKeyPairFromPassword({ password }) {
  const nonce = _tweetnaclutil2.default.encodeBase64(_tweetnacl2.default.randomBytes(_tweetnacl2.default.box.nonceLength));
  const encryption = await keyPairFromPassword({ nonce, password, signing: false });
  return {
    nonce,
    ...encryption
  };
}
function decrypt(encrypted, keyPair) {
  const secretKeyUint = _tweetnaclutil2.default.decodeBase64(keyPair.secretKey);
  const messageAndNonce = _tweetnaclutil2.default.decodeBase64(encrypted);
  const boxNonce = messageAndNonce.slice(0, _tweetnacl2.default.box.nonceLength);
  const message = messageAndNonce.slice(
    _tweetnacl2.default.box.nonceLength,
    messageAndNonce.length
  );
  const payload = _tweetnacl2.default.secretbox.open(message, boxNonce, secretKeyUint);
  if (!payload)
    throw Error("invalid password");
  const payloadString = _tweetnaclutil2.default.encodeUTF8(payload);
  return JSON.parse(payloadString);
}
function encrypt(decrypted, keyPair) {
  const dataString = JSON.stringify(decrypted);
  const secreKeyUint = _tweetnaclutil2.default.decodeBase64(keyPair.secretKey);
  const nonce = _tweetnacl2.default.randomBytes(_tweetnacl2.default.box.nonceLength);
  const message = _tweetnaclutil2.default.decodeUTF8(dataString);
  const box = _tweetnacl2.default.secretbox(message, nonce, secreKeyUint);
  const encrypted = new Uint8Array(nonce.length + box.length);
  encrypted.set(nonce);
  encrypted.set(box, nonce.length);
  return _tweetnaclutil2.default.encodeBase64(encrypted);
}






exports.decrypt = decrypt; exports.encrypt = encrypt; exports.keyPairFromPassword = keyPairFromPassword; exports.nonceAndKeyPairFromPassword = nonceAndKeyPairFromPassword; exports.randomKeyPair = randomKeyPair;
