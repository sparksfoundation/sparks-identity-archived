"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }require('../chunk-WMBHDRFC.cjs');
var _tweetnacl = require('tweetnacl'); var _tweetnacl2 = _interopRequireDefault(_tweetnacl);
var _tweetnaclutil = require('tweetnacl-util'); var _tweetnaclutil2 = _interopRequireDefault(_tweetnaclutil);
const signingKeyPair = async () => {
  const signing = _tweetnacl2.default.sign.keyPair();
  return {
    publicKey: _tweetnaclutil2.default.encodeBase64(signing.publicKey),
    secretKey: _tweetnaclutil2.default.encodeBase64(signing.secretKey)
  };
};
const encryptionKeyPair = async () => {
  const encryption = _tweetnacl2.default.box.keyPair();
  return {
    publicKey: _tweetnaclutil2.default.encodeBase64(encryption.publicKey),
    secretKey: _tweetnaclutil2.default.encodeBase64(encryption.secretKey)
  };
};
const keyPairs = async () => {
  return Promise.all([signingKeyPair(), encryptionKeyPair()]).then(([signing, encryption]) => {
    return {
      signing,
      encryption
    };
  });
};
var random_default = keyPairs;


exports.default = random_default;
