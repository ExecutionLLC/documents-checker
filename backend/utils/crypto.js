const crypto = require('crypto');


class CryptoUtils {
    static generateInitializationVector(length) {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(length, (error, buffer) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(buffer);
                }
            });
        });
    }
}

module.exports = CryptoUtils;