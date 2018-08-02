const BaseController = require('./BaseController');
const getLogger = require('../utils/log');
const ErrorUtils = require('../utils/error');
const Express = require('express');
const ServerError = require('../utils/errors/ServerError');

class SchemasController extends BaseController {
    constructor(services) {
        const logger = getLogger('SchemasController');
        super(services, logger);
    }

    _verifyAddParams(schemaId, schemaContainer, schemaPrivateKey) {
        return new Promise((resolve, reject) => {
            ErrorUtils.throwErrorIfValueIsEmpty(schemaId, 'schemaId');
            ErrorUtils.throwErrorIfValueIsEmpty(schemaContainer, 'schemaContainer');
            ErrorUtils.throwErrorIfValueIsEmpty(schemaPrivateKey, 'schemaPrivateKey');

            return resolve();
        });
    }

    add(request, response) {
        const requestId = this._generateIdAndWriteRequestLog(request);

        const {schemaId} = request.params;
        const {
            schemaContainer,
            schemaPrivateKey
        } = request.body;

        this._verifyAddParams(
            schemaId,
            schemaContainer,
            schemaPrivateKey
        ).then(() => {
            return this._services.schemasService.add(
                schemaId,
                schemaContainer,
                schemaPrivateKey
            );
        }).then(() => {
            this._sendOkAndWriteResponseLog(requestId, response);
        }).catch((error) => {
            this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
        });
    }

    _verifyIsExistsParams(schemaId) {
        return new Promise((resolve, reject) => {
            ErrorUtils.throwErrorIfValueIsEmpty(schemaId, 'schemaId');

            return resolve();
        });
    }

    isExists(request, response) {
        const requestId = this._generateIdAndWriteRequestLog(request);

        const {schemaId} = request.params;

        this._verifyIsExistsParams(schemaId).then(() => {
            return this._services.schemasService.isExists(schemaId)
        }).then((result) => {
            this._sendJsonAndWriteResponseLog(requestId, response, result);
        }).catch((error) => {
            this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
        });
    }

    _verifyGetParams(schemaId, schemaPrivateKey) {
        return new Promise((resolve, reject) => {
            ErrorUtils.throwErrorIfValueIsEmpty(schemaId, 'schemaId');
            ErrorUtils.throwErrorIfValueIsEmpty(schemaPrivateKey, 'schemaPrivateKey');

            return resolve();
        });
    }

    get(request, response) {
        const requestId = this._generateIdAndWriteRequestLog(request);

        const {schemaId} = request.params;
        const schemaPrivateKey = request.get('X-Schema-Private-Key');

        this._verifyGetParams(schemaId, schemaPrivateKey).then(() => {
            return this._services.schemasService.get(schemaId, schemaPrivateKey);
        }).then((schemaDataPart) => {
            this._sendJsonAndWriteResponseLog(requestId, response, schemaDataPart);
        }).catch((error) => {
            this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
        });
    }

    createRouter() {
        const router = new Express();

        router.post('/:schemaId', this.add.bind(this));
        router.get('/:schemaId', this.isExists.bind(this));
        router.get('/:schemaId/data', this.get.bind(this));

        return router;
    }
}

module.exports = SchemasController;
