const BaseService = require('./BaseService');

class SchemasService extends BaseService {
    constructor(models) {
	super(models);
    }

    add(schemaId, schemaIdPart, schemaDataPart, schemaPrivateKey) {
	return this._models.schemasModel.add(
	    schemaId,
	    schemaIdPart,
	    schemaDataPart,
	    schemaPrivateKey
	);
    }

    get(schemaId, schemaPrivateKey) {
	return this._models.schemasModel.get(
	    schemaId,
	    schemaPrivateKey
	);
    }

    isExists(schemaId) {
	return this._models.schemasModel.isExists(schemaId);
    }
} 

module.exports = SchemasService;
