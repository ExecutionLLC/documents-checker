const BaseController = require('./BaseController');
const getLogger = require('../utils/log');
const Express = require('express');

class SchemasController extends BaseController {
    constructor(services) {
        const logger = getLogger('SchemasController');
        super(services, logger);
    }

    add(request, response) {
        const requestId = this._generateIdAndWriteRequestLog(request);

        const {schemaId} = request.params;
        const {
            schemaIdPart,
            schemaDataPart,
            schemaPrivateKey
        } = request.body;
        this._services.schemasService.add(
            schemaId,
            schemaIdPart,
            schemaDataPart,
            schemaPrivateKey
        ).then(() => {
            this._sendOkAndWriteResponseLog(requestId, response);
        }).catch((error) => {
            this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
        });
    }

    isExists(request, response) {
        const requestId = this._generateIdAndWriteRequestLog(request);

        const {schemaId} = request.params;
        this._services.schemasService.isExists(schemaId).then((result) => {
            this._sendJsonAndWriteResponseLog(requestId, response, result);
        }).catch((error) => {
            this._sendErrorAndWriteResponseLogAndErrorLog(requestId, response, error);
        });
    }

    get(request, response) {
        const requestId = this._generateIdAndWriteRequestLog(request);

        const {schemaId} = request.params;
        const {schemaPrivateKey} = request.body;
        this._services.schemasService.get(
            schemaId,
            schemaPrivateKey
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
        router.get('/:schemaId/data', this.get.bind(this));

        return router;
    }
}

module.exports = SchemasController;
