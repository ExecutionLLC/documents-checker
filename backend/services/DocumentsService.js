const BaseService = require('./BaseService');

class DocumentService extends BaseService {
    constructor(models) {
	super(models);
    }

    add(schemaId, documentIdPart, documentDataPart, schemaPrivateKey, documentPrivateKey) {
	return this.models.documentModel.add(
	    schemaId,
	    documentIdPart,
	    documentDataPart,
	    schemaPrivateKey,
	    documentPrivateKey
	);
    }

    getDataPart(schemaId, documentIdPart, schemaPrivateKey, documentPrivateKey) {
	return this.models.documentModel.getDataPart(
	    schemaId,
	    documentIdPart,
	    schemaPrivateKey,
	    documentPrivateKey
	);
    }

    isExists(schemaId, documentIdPart) {
    	return this.models.documentModel.isExists(
	    schemaId,
	    documentIdPart
	);
    }
}
