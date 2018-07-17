const HttpStatusCodes = require('http-status-codes');

class BaseController {
    constructor(services, logger) {
        this._services = services;
        this._logger = logger;
    }

    sendOk(response) {
        response.status(HttpStatusCodes.OK);
        response.end();
    }

    sendJson(response, data) {
        response.json(data);
        response.end();
    }

    sendError(response, error, errorHttpStatusCode) {
        const statusCode = errorHttpStatusCode || HttpStatusCodes.INTERNAL_SERVER_ERROR;
        response.status(statusCode);
        response.json(error);

        this._logger.warn('send error (%d):', statusCode, error);

        response.end();
    }
}

module.exports = BaseController;
