const ServerError = require('./errors/ServerError');

class ErrorUtils {
    static throwErrorIfValueIsEmpty(value, valueName) {
        if (!value) {
            throw new ServerError(`${valueName} must be filled`);
        }
    }
}

module.exports = ErrorUtils;