const Express = require('express');

const SchemasController = require('./SchemasController');
const DocumentsController = require('./DocumentsController');

class ControllersFacsde {
    constructor(services) {
	this.schemasController = new SchemasController(services);
	this.documentsController = new DocumentsController(services);
    }

    createRouter() {
	const router = new Express();
	router.use('/schemas', this.schemasController.createRouter());
	router.use('/documents', this.documentsController.createRouter());
	return router;
    }
}
