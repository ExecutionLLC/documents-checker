const BaseController = require('./BaseController');
const Express = require('express');
const getLogger = require('../utils/log');

class DocumentsController extends BaseController {
    constructor(services) {
        const logger = getLogger('DocumentsController');
        super(services, logger);
    }

    add(request, response) {
        this._logger.verbose('got new "add" request (body = "%o")', request.body);

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
            this.sendOk(response);
        }).catch((error) => {
            this.sendError(response, error);
        });
    }

    isExists() {
        this._logger.verbose('got new "isExists" request (body = "%o")', request.body);

        const {
            schemaId,
            documentIdPart
        } = request.body;
        this._services.documentsService.add(
            schemaId,
            documentIdPart
        ).then((result) => {
            this.sendJson(response, result);
        }).catch((error) => {
            this.sendError(response, error);
        });
    }

    getDataPart(request, response) {
        this._logger.verbose('got new "getDataPart" request (body = "%o")', request.body);

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
            this.sendJson(response, documentDataPart);
        }).catch((error) => {
            this.sendError(response, error);
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