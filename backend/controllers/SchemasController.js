const BaseController = require('./BaseController');
const Express = require('express');

class SchemasController extends BaseController {
    constructor(services) {
        const logger = getLogger('SchemasController');
        super(services, logger);
    }

    add(request, response) {
        const {schemaId} = request;

        this._logger.verbose('got new "add" request:', schemaId, request.body);

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

    isExists() {
        const {schemaId} = request;

        this._logger.verbose('got new "isExists" request:', schemaId, request.body);

        this.srvices.schemasService.isExists(
            schemaId
        ).then(() => {
            this.sendOk(response);
        }).catch((error) => {
            this.sendError(response, error);
        });
    }

    get(request, response) {
        const {schemaId} = request;

        this._logger.verbose('got new "get" request:', schemaId, request.body);

        const {schemaPrivateKey} = request.body;
        this.srvices.schemasService.getDataPart(
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
