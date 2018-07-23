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

        const {
            schemaId,
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

        const {
            schemaId,
            documentIdPart
        } = request.body;
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

        const {
            schemaId,
            documentIdPart,
            schemaPrivateKey,
            documentPrivateKey
        } = request.body;
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

        router.post('/', this.add.bind(this));
        router.get('/', this.isExists.bind(this));
        router.get('/data', this.getDataPart.bind(this));

        return router;
    }
} 

module.exports = DocumentsController;