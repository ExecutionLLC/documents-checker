const BaseService = require('./BaseService');
const getLogger = require('../utils/log');

class DocumentService extends BaseService {
    constructor(models) {
        const logger = getLogger('DocumentService');
        super(models);
    }

    add(schemaId, documentIdPart, documentDataPart, schemaPrivateKey, documentPrivateKey) {
        return this._models.documentsModel.add(
            schemaId,
            documentIdPart,
            documentDataPart,
            schemaPrivateKey,
            documentPrivateKey
        );
    }

    getDataPart(schemaId, documentIdPart, schemaPrivateKey, documentPrivateKey) {
        return this._models.documentsModel.getDataPart(
            schemaId,
            documentIdPart,
            schemaPrivateKey,
            documentPrivateKey
        );
    }

    isExists(schemaId, documentIdPart) {
        return this._models.documentsModel.isExists(
            schemaId,
            documentIdPart
        );
    }
}

module.exports = DocumentService;
