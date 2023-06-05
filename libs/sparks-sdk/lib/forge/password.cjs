"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }require('../chunk-WMBHDRFC.cjs');
var _tweetnacl = require('tweetnacl'); var _tweetnacl2 = _interopRequireDefault(_tweetnacl);
var _tweetnaclutil = require('tweetnacl-util'); var _tweetnaclutil2 = _interopRequireDefault(_tweetnaclutil);
var _scryptpbkdf = require('scrypt-pbkdf'); var scrypt = _interopRequireWildcard(_scryptpbkdf);
var _blake3 = require('@noble/hashes/blake3');
const generateSalt = (identity) => {
  return _tweetnaclutil2.default.encodeBase64(_blake3.blake3.call(void 0, JSON.stringify(identity)));
};
const signingKeyPair = async ({ password, identity }) => {
  const options = { N: 16384, r: 8, p: 1 };
  const salt = generateSalt(identity);
  const buffer = await scrypt.scrypt(
    password,
    salt,
    _tweetnacl2.default.box.secretKeyLength / 2,
    options
  );
  const seed = [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
  const uint8Seed = _tweetnaclutil2.default.decodeUTF8(seed);
  const uint8Keypair = _tweetnacl2.default.sign.keyPair.fromSeed(uint8Seed);
  return {
    publicKey: _tweetnaclutil2.default.encodeBase64(uint8Keypair.publicKey),
    secretKey: _tweetnaclutil2.default.encodeBase64(uint8Keypair.secretKey)
  };
};
const encryptionKeyPair = async ({ password, identity }) => {
  const options = { N: 16384, r: 8, p: 1 };
  const salt = generateSalt(identity);
  const buffer = await scrypt.scrypt(
    password,
    salt,
    _tweetnacl2.default.box.secretKeyLength / 2,
    options
  );
  const seed = [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
  const uint8Seed = _tweetnaclutil2.default.decodeUTF8(seed);
  const uint8Keypair = _tweetnacl2.default.box.keyPair.fromSecretKey(uint8Seed);
  return {
    publicKey: _tweetnaclutil2.default.encodeBase64(uint8Keypair.publicKey),
    secretKey: _tweetnaclutil2.default.encodeBase64(uint8Keypair.secretKey)
  };
};
const keyPairs = async ({ password, identity = "" }) => {
  return Promise.all([signingKeyPair({ password, identity }), encryptionKeyPair({ password, identity })]).then(([signing, encryption]) => {
    return {
      signing,
      encryption
    };
  });
};
var password_default = keyPairs;


exports.default = password_default;
