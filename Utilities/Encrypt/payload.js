const CryptoJS = require('crypto-js')


const encryptionPayload = async (message) => {
    return CryptoJS.AES.encrypt(JSON.stringify(message), 'QVIPLESAASPLATFORM').toString()
}

const decryptKey = async (data) => {
    var bytes = CryptoJS.AES.decrypt(data, 'QVIPLESAASPLATFORM');
    var key = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return key  
}

module.exports = encryptionPayload, decryptKey

