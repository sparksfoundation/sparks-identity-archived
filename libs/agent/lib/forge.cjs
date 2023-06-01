"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }require('./chunk-WMBHDRFC.cjs');
var _scryptpbkdf = require('scrypt-pbkdf'); var scrypt = _interopRequireWildcard(_scryptpbkdf);
var _tweetnacl = require('tweetnacl'); var _tweetnacl2 = _interopRequireDefault(_tweetnacl);
var _tweetnaclutil = require('tweetnacl-util'); var _tweetnaclutil2 = _interopRequireDefault(_tweetnaclutil);
const signingKeysFromRandom = async () => {
  const signing = _tweetnacl2.default.sign.keyPair();
  return {
    publicKey: _tweetnaclutil2.default.encodeBase64(signing.publicKey),
    secretKey: _tweetnaclutil2.default.encodeBase64(signing.secretKey)
  };
};
const encryptionKeysFromRandom = async () => {
  const encryption = _tweetnacl2.default.box.keyPair();
  return {
    publicKey: _tweetnaclutil2.default.encodeBase64(encryption.publicKey),
    secretKey: _tweetnaclutil2.default.encodeBase64(encryption.secretKey)
  };
};
const keyPairsFromRandom = async () => {
  return {
    signing: await signingKeysFromRandom(),
    encryption: await encryptionKeysFromRandom()
  };
};
const signingKeysFromPassword = async ({ password, salt: noise }) => {
  const options = { N: 16384, r: 8, p: 1 };
  const salt = noise || _tweetnacl2.default.randomBytes(_tweetnacl2.default.secretbox.nonceLength);
  const buffer = await scrypt.scrypt(password, salt, _tweetnacl2.default.box.secretKeyLength / 2, options);
  const seed = [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
  const uint8Seed = _tweetnaclutil2.default.decodeUTF8(seed);
  const uint8Keypair = _tweetnacl2.default.sign.keyPair.fromSeed(uint8Seed);
  return {
    publicKey: _tweetnaclutil2.default.encodeBase64(uint8Keypair.publicKey),
    secretKey: _tweetnaclutil2.default.encodeBase64(uint8Keypair.secretKey)
  };
};
const randomSalt = (len = 16) => {
  return _tweetnaclutil2.default.encodeBase64(_tweetnacl2.default.randomBytes(len));
};
const encryptionKeysFromPassword = async ({ password, salt: noise }) => {
  const options = { N: 16384, r: 8, p: 1 };
  const salt = noise || _tweetnacl2.default.randomBytes(_tweetnacl2.default.secretbox.nonceLength);
  const buffer = await scrypt.scrypt(password, salt, _tweetnacl2.default.box.secretKeyLength / 2, options);
  const seed = [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
  const uint8Seed = _tweetnaclutil2.default.decodeUTF8(seed);
  const uint8Keypair = _tweetnacl2.default.box.keyPair.fromSecretKey(uint8Seed);
  return {
    publicKey: _tweetnaclutil2.default.encodeBase64(uint8Keypair.publicKey),
    secretKey: _tweetnaclutil2.default.encodeBase64(uint8Keypair.secretKey)
  };
};
const keyPairsFromPassword = async ({ password, salt }) => {
  return {
    signing: await signingKeysFromPassword({ password, salt }),
    encryption: await encryptionKeysFromPassword({ password, salt })
  };
};








exports.encryptionKeysFromPassword = encryptionKeysFromPassword; exports.encryptionKeysFromRandom = encryptionKeysFromRandom; exports.keyPairsFromPassword = keyPairsFromPassword; exports.keyPairsFromRandom = keyPairsFromRandom; exports.randomSalt = randomSalt; exports.signingKeysFromPassword = signingKeysFromPassword; exports.signingKeysFromRandom = signingKeysFromRandom;
