const CryptoJS = require("crypto-js");

const encryptionPayload = async (message) => {
  return CryptoJS.AES.encrypt(
    JSON.stringify(message),
    `${process.env.STATICKEY}`
  ).toString();
};

exports.decryptKey = async (data) => {
  const bytes = CryptoJS.AES.decrypt(data, `${process.env.STATICKEY}`);
  const key = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return key;
};

exports.decryptPayload = async (data) => {
  const bytes = CryptoJS.AES.decrypt(data, `${process.env.STATICKEY}`);
  const query = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  return query;
};

module.exports = encryptionPayload;
