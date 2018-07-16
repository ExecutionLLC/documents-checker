const Express = require('express');
const DocumentsController = require('./DocumentsController');
const LoggerFactory = require('../utils/log');
const SchemasController = require('./SchemasController');

class ControllersFacade {
    constructor(services) {
	this.schemasController = new SchemasController(services);
	this.documentsController = new DocumentsController(services);
	this._logger = LoggerFactory('ControllersFacsde');
    }

    createRouter() {
	const router = new Express();
	router.use('/schemas', this.schemasController.createRouter());
	router.use('/documents', this.documentsController.createRouter());
	router.use(this._notFoundHandler)
	return router;
    }

    _notFoundHandler(request, respones, next) {
	respones.status(HttpStatusCodes.NOT_FOUND);
	respones.json({error: 'Not found'});
	this._logger.warn('%s %d %s', request.method, respones.statusCode, request.url);
	respones.end();
    }
}
