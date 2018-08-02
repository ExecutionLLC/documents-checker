const HttpStatusCodes = require('http-status-codes');
const ServerError = require('./ServerError');

class ConflictError extends ServerError {
    constructor(message) {
        super(message || 'Conflict', HttpStatusCodes.CONFLICT);
        this.name = 'ConflictError';
    }
}

module.exports = ConflictError;