const BaseService = require('./BaseService');
const getLogger = require('../utils/log');

class DocumentService extends BaseService {
    constructor(models) {
        const logger = getLogger('DocumentService');
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
