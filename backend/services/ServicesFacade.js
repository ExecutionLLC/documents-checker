const DocumentsService = require('./DocumentsService');
const getLogger = require('../utils/log');
const SchemasService = require('./SchemasService');

class ServicesFacade {
    constructor(models) {
        this._models = models;
        this.schemasService = new SchemasService(models);
        this.documentsService = new DocumentsService(models);
        this._logger = getLogger('ServicesFacade');
    }

    start() {
        return Promise.all([
            this._models.init(),
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

module.exports = ServicesFacade;
