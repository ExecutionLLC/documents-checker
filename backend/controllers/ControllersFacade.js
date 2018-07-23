const Express = require('express');
const getLogger = require('../utils/log');
const HttpStatusCodes = require('http-status-codes');

const BaseController = require('./BaseController');
const DocumentsController = require('./DocumentsController');
const SchemasController = require('./SchemasController');

class ControllersFacade {
    constructor(services) {
        this.schemasController = new SchemasController(services);
        this.documentsController = new DocumentsController(services);
        this._logger = getLogger('ControllersFacade');
    }

    init() {
        return Promise.all([
            this.schemasController.init(),
            this.documentsController.init()
        ]);
    }

    createRouter() {
        const router = new Express();
        router.use('/schemas', this.schemasController.createRouter());
        router.use('/documents', this.documentsController.createRouter());
        router.use(this._notFoundHandler.bind(this));
        return router;
    }

    _notFoundHandler(request, respones) {
        BaseController.sendJson(
            respones,
            {error: 'Not found'},
            HttpStatusCodes.NOT_FOUND
        );
        this._logger.warn('%s %d %s', request.method, respones.statusCode, request.url);
    }
}

module.exports = ControllersFacade;
