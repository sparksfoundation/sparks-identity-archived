"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }require('../chunk-WMBHDRFC.cjs');
var _tweetnacl = require('tweetnacl'); var _tweetnacl2 = _interopRequireDefault(_tweetnacl);
var _tweetnaclutil = require('tweetnacl-util'); var _tweetnaclutil2 = _interopRequireDefault(_tweetnaclutil);
const signingKeyPair = () => {
  const signing = _tweetnacl2.default.sign.keyPair();
  return {
    publicKey: _tweetnaclutil2.default.encodeBase64(signing.publicKey),
    secretKey: _tweetnaclutil2.default.encodeBase64(signing.secretKey)
  };
};
const encryptionKeyPair = () => {
  const encryption = _tweetnacl2.default.box.keyPair();
  return {
    publicKey: _tweetnaclutil2.default.encodeBase64(encryption.publicKey),
    secretKey: _tweetnaclutil2.default.encodeBase64(encryption.secretKey)
  };
};
const keyPairs = () => {
  return {
    signing: signingKeyPair(),
    encryption: encryptionKeyPair()
  };
};
var random_default = keyPairs;


exports.default = random_default;
