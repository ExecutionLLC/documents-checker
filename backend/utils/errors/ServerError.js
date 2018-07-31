const HttpStatusCodes = require('http-status-codes');

class ServerError extends Error {
    constructor(message, httpStatusCode) {
        super(message || 'Unknown server error');
        this.name = 'ServerError';
        this.httpStatusCode = httpStatusCode || HttpStatusCodes.INTERNAL_SERVER_ERROR;
    }
}

module.exports = ServerError;