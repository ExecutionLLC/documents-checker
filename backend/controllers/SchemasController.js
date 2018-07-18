const BaseController = require('./BaseController');
const getLogger = require('../utils/log');
const Express = require('express');

class SchemasController extends BaseController {
    constructor(services) {
        const logger = getLogger('SchemasController');
        super(services, logger);
    }

    add(request, response) {
        const {schemaId} = request;

        this._logger.verbose('got new "add" request (schemaId = "%s"; body = "%o")', schemaId, request.body);

        const {
            schemaIdPart,
            schemaDataPart,
            schemaPrivateKey
        } = request.body;
        this.srvices.schemasService.add(
            schemaId,
            schemaIdPart,
            schemaDataPart,
            schemaPrivateKey
        ).then(() => {
            this.sendOk(response);
        }).catch((error) => {
            this.sendError(response, error);
        });
    }

    isExists(request, response) {
        const {schemaId} = request.params;

        this._logger.verbose('got new "isExists" request (schemaId = "%s")', schemaId);

        this._services.schemasService.isExists(schemaId).then((result) => {
            this.sendJson(response, result);
        }).catch((error) => {
            this.sendError(response, error);
        });
    }

    get(request, response) {
        const {schemaId} = request.params;

        this._logger.verbose('got new "get" request (schemaId = "%s"; body = "%o")', schemaId, request.body);

        const {schemaPrivateKey} = request.body;
        this._services.schemasService.get(
            schemaId,
            schemaPrivateKey
        ).then((documentDataPart) => {
            this.sendJson(response, documentDataPart);
        }).catch((error) => {
            this.sendError(response, error);
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
