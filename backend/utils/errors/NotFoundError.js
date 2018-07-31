const HttpStatusCodes = require('http-status-codes');
const ServerError = require('./ServerError');

class NotFoundError extends ServerError {
    constructor(message) {
        super(message || 'Item not found', HttpStatusCodes.NOT_FOUND);
        this.name = 'NotFoundError';
    }
}

module.exports = NotFoundError;