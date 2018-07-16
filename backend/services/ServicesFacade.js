const SchemasService = require('./SchemasService');
const DocumentsService = require('./DocumentsService');

class ServicesFacade {
    constructor(models) {
	this.schemasService = new SchemasService(models);
	this.documentsService = new DocumentsService(models);
    }

    start() {
	return Promise.all([
	    this.schemasService.start(),
	    this.documentsService.start()
	]);
    }

    stop() {
	return Promise.all([
	    this.schemasService.stop(),
	    this.documentsService.stop()
	]);
    }
}
