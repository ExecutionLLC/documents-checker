const BaseController = require('./BaseController');
const Express = require('express');
const getLogger = require('../utils/log');

class DocumentsController extends BaseController {
    constructor(services) {
        const logger = getLogger('DocumentsController');
        super(services, logger);
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
        this._services.documentsService.add(
            schemaId,
            documentIdPart,
            documentDataPart,
            schemaPrivateKey,
            documentPrivateKey
        ).then(() => {
            this._sendOkAndWriteResponseLog(requestId, response);
        }).catch((error) => {
            this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
        });
    }

    isExists(request, response) {
        const requestId = this._generateIdAndWriteRequestLog(request);

        const {schemaId} = request.params;
        const documentIdPart = request.get('X-Document-Id');

        this._services.documentsService.isExists(
            schemaId,
            documentIdPart
        ).then((result) => {
            this._sendJsonAndWriteResponseLog(requestId, response, result);
        }).catch((error) => {
            this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
        });
    }

    getDataPart(request, response) {
        const requestId = this._generateIdAndWriteRequestLog(request);

        const {schemaId} = request.params;
        const documentIdPart = request.get('X-Document-Id');
        const schemaPrivateKey = request.get('X-Schema-Private-Key');
        const documentPrivateKey = request.get('X-Document-Private-Key');

        this._services.documentsService.getDataPart(
            schemaId,
            documentIdPart,
            schemaPrivateKey,
            documentPrivateKey
        ).then((documentDataPart) => {
            this._sendJsonAndWriteResponseLog(requestId, response, documentDataPart);
        }).catch((error) => {
            this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
        });
    }

    createRouter() {
        const router = new Express();

        router.post('/:schemaId', this.add.bind(this));
        router.get('/:schemaId', this.isExists.bind(this));
        router.get('/:schemaId/data', this.getDataPart.bind(this));

        return router;
    }
} 

module.exports = DocumentsController;