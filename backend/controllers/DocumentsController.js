const BaseController = require('./BaseController');
const ErrorUtils = require('../utils/error');
const Express = require('express');
const getLogger = require('../utils/log');
const HttpStatusCodes = require('http-status-codes');

const { Base64 } = require('js-base64');

class DocumentsController extends BaseController {
    constructor(services) {
        const logger = getLogger('DocumentsController');
        super(services, logger);
    }

    _verifyAddParams(schemaId, documentIdPart, documentDataPart, schemaPrivateKey, documentPrivateKey) {
        return new Promise((resolve, reject) => {
            ErrorUtils.throwErrorIfValueIsEmpty(schemaId, 'schemaId');
            ErrorUtils.throwErrorIfValueIsEmpty(documentIdPart, 'documentIdPart');
            ErrorUtils.throwErrorIfValueIsEmpty(documentDataPart, 'documentDataPart');
            ErrorUtils.throwErrorIfValueIsEmpty(schemaPrivateKey, 'schemaPrivateKey');
            ErrorUtils.throwErrorIfValueIsEmpty(documentPrivateKey, 'documentPrivateKey');

            return resolve();
        });
    }

    add(request, response) {
        const requestId = this._generateIdAndWriteRequestLog(request);

        const {schemaId} = request.params;
        const {
            documentIdPart,
            documentDataPart,
            schemaPrivateKey,
            documentPrivateKey
        } = request.body;

        this._verifyAddParams(
            schemaId,
            documentIdPart,
            documentDataPart,
            schemaPrivateKey,
            documentPrivateKey
        ).then(() => {
            return this._services.documentsService.add(
                schemaId,
                documentIdPart,
                documentDataPart,
                schemaPrivateKey,
                documentPrivateKey
            );
        }).then((transactionId) => {
            this._sendJsonAndWriteResponseLog(requestId, response, {transactionId}, HttpStatusCodes.CREATED);
        }).catch((error) => {
            this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
        });
    }

    _verifyIsExistsParams(schemaId, documentIdPartAsString) {
        return new Promise((resolve, reject) => {
            ErrorUtils.throwErrorIfValueIsEmpty(schemaId, 'schemaId');
            ErrorUtils.throwErrorIfValueIsEmpty(documentIdPartAsString, 'documentIdPartAsString');

            return resolve();
        });
    }

    isExists(request, response) {
        const requestId = this._generateIdAndWriteRequestLog(request);

        const {schemaId} = request.params;
        const documentIdPartAsBase64 = request.get('X-Document-Id');
        const documentIdPartAsString = Base64.decode(documentIdPartAsBase64);

        this._verifyIsExistsParams(schemaId, documentIdPartAsString).then(() => {
            return this._services.documentsService.isExists(schemaId, JSON.parse(documentIdPartAsString));
        }).then((result) => {
            this._sendJsonAndWriteResponseLog(requestId, response, result);
        }).catch((error) => {
            this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
        });
    }

    _verifyGetDataPartParams(schemaId, documentIdPart, schemaPrivateKey, documentPrivateKey) {
        return new Promise((resolve, reject) => {
            ErrorUtils.throwErrorIfValueIsEmpty(schemaId, 'schemaId');
            ErrorUtils.throwErrorIfValueIsEmpty(documentIdPart, 'documentIdPart');
            ErrorUtils.throwErrorIfValueIsEmpty(schemaPrivateKey, 'schemaPrivateKey');
            ErrorUtils.throwErrorIfValueIsEmpty(documentPrivateKey, 'documentPrivateKey');

            return resolve();
        });
    }

    getDataPart(request, response) {
        const requestId = this._generateIdAndWriteRequestLog(request);

        const {schemaId} = request.params;
        const documentIdPartAsBase64 = request.get('X-Document-Id');
        const documentIdPartAsString = Base64.decode(documentIdPartAsBase64);
        const schemaPrivateKey = request.get('X-Schema-Private-Key');
        const documentPrivateKey = request.get('X-Document-Private-Key');

        this._verifyGetDataPartParams(
            schemaId,
            documentIdPartAsString,
            schemaPrivateKey,
            documentPrivateKey
        ).then(() => {
            return this._services.documentsService.getDataPart(
                schemaId,
                JSON.parse(documentIdPartAsString),
                schemaPrivateKey,
                documentPrivateKey
            );
        }).then((documentDataPart) => {
            this._sendJsonAndWriteResponseLog(requestId, response, documentDataPart);
        }).catch((error) => {
            this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
        });
    }

    _verifyUpdateDynamicPartParams(schemaId, documentIdPart, documentDynamicPart, schemaPrivateKey, documentPrivateKey) {
        return new Promise((resolve, reject) => {
            ErrorUtils.throwErrorIfValueIsEmpty(schemaId, 'schemaId');
            ErrorUtils.throwErrorIfValueIsEmpty(documentIdPart, 'documentIdPart');
            ErrorUtils.throwErrorIfValueIsEmpty(documentDynamicPart, 'documentDynamicPart');
            ErrorUtils.throwErrorIfValueIsEmpty(schemaPrivateKey, 'schemaPrivateKey');
            ErrorUtils.throwErrorIfValueIsEmpty(documentPrivateKey, 'documentPrivateKey');

            return resolve();
        });
    }

    updateDynamicPart(request, response) {
        const requestId = this._generateIdAndWriteRequestLog(request);

        const {schemaId} = request.params;
        const {
            documentIdPart,
            documentDynamicPart,
            schemaPrivateKey,
            documentPrivateKey
        } = request.body;

        this._verifyUpdateDynamicPartParams(
            schemaId,
            documentIdPart,
            documentDynamicPart,
            schemaPrivateKey,
            documentPrivateKey
        ).then(() => {
            return this._services.documentsService.updateDynamicPart(
                schemaId,
                documentIdPart,
                documentDynamicPart,
                schemaPrivateKey,
                documentPrivateKey
            );
        }).then((transactionId) => {
            this._sendJsonAndWriteResponseLog(requestId, response, {transactionId});
        }).catch((error) => {
            this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
        });
    }

    createRouter() {
        const router = new Express();

        router.post('/:schemaId', this.add.bind(this));
        router.get('/:schemaId', this.isExists.bind(this));
        router.get('/:schemaId/data', this.getDataPart.bind(this));
        router.put('/:schemaId/data/dynamicPart', this.updateDynamicPart.bind(this));

        return router;
    }
} 

module.exports = DocumentsController;