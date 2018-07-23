const HttpStatusCodes = require('http-status-codes');

const DEFAULT_REQUEST_LOG_LEVEL = 'verbose';
const DEFAULT_RESPONSE_LOG_LEVEL = 'verbose';

let NEXT_REQUEST_ID = 1;

class BaseController {
    constructor(services, logger) {
        this._services = services;
        this._logger = logger;
    }

    init() {
        return new Promise((resolve, reject)  => {
            this._logger.info('initialized');
            resolve();
        })
    }

    static sendOk(response) {
        response.status(HttpStatusCodes.OK);
        response.end();
    }

    static sendJson(response, data, statusCode) {
        response.status(statusCode || HttpStatusCodes.OK);
        response.json(data);
        response.end();
    }

    static sendError(response, error, errorHttpStatusCode) {
        const statusCode = errorHttpStatusCode || HttpStatusCodes.INTERNAL_SERVER_ERROR;
        const errorMessage = (error && error.message) ? error.message : 'Unknown error';

        response.status(statusCode);
        response.json({error: errorMessage});
        response.end();
    }

    static _generateRequestId() {
        return NEXT_REQUEST_ID++;
    }

    static writeRequestLog(logger, requestId, request, logLevel) {
        const { method, originalUrl, params, body } = request;
        logger.log(
            logLevel || DEFAULT_REQUEST_LOG_LEVEL,
            'REQUEST (%d) (method = "%s"; URL = "%s"; params = "%o"; body = "%o")',
            requestId, method, originalUrl, params, body
        );
    }

    static generateIdAndWriteRequestLog(logger, request, logLevel) {
        const requestId = BaseController._generateRequestId();
        BaseController.writeRequestLog(logger, requestId, request, logLevel);
        return requestId;
    }

    _generateIdAndWriteRequestLog(request, logLevel) {
        return BaseController.generateIdAndWriteRequestLog(this._logger, request, logLevel);
    }

    static writeResponseLog(logger, requestId, response, json, logLevel) {
        const { statusCode } = response;
        logger.log(
            logLevel || DEFAULT_RESPONSE_LOG_LEVEL,
            'RESPONSE (%d) (statusCode = "%d"; json = "%o")',
            requestId, statusCode, json
        );
    }

    static writeResponseLogAndErrorLog(logger, requestId, response, error) {
        const { statusCode } = response;
        const errorMessage = (error && error.message) ? error.message : 'Unknown error';

        logger.error(
            'RESPONSE (%d) (statusCode = "%d"; errorMessage = "%s")',
            requestId, statusCode, errorMessage
        );
        if (error && error.stack) {
            logger.debug('%s', error.stack);
        }
    }

    static sendOkAndWriteResponseLog(logger, requestId, response) {
        BaseController.sendOk(response);
        BaseController.writeResponseLog(logger, requestId, response, null);
    }

    _sendOkAndWriteResponseLog(requestId, response) {
        BaseController.sendOkAndWriteResponseLog(this._logger, requestId, response);
    }

    static sendJsonAndWriteResponseLog(logger, requestId, response, data, statusCode, logLevel) {
        BaseController.sendJson(response, data, statusCode);
        BaseController.writeResponseLog(logger, requestId, response, data, logLevel);
    }

    _sendJsonAndWriteResponseLog(requestId, response, data, statusCode, logLevel) {
        BaseController.sendJsonAndWriteResponseLog(this._logger, requestId, response, data, statusCode, logLevel);
    }

    static sendErrorAndWriteResponseLogAndErrorLog(logger, requestId, response, error, errorHttpStatusCode) {
        BaseController.sendError(response, error, errorHttpStatusCode);
        BaseController.writeResponseLogAndErrorLog(logger, requestId, response, error);
    }

    _sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error, errorHttpStatusCode) {
        BaseController.sendErrorAndWriteResponseLogAndErrorLog(this._logger, requestId, response, error, errorHttpStatusCode);
    }
}

module.exports = BaseController;
