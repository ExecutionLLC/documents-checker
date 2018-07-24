const BaseService = require('./BaseService');
const CryptoUtils = require('../utils/crypto');
const getLogger = require('../utils/log');

class DocumentService extends BaseService {
    constructor(models) {
        const logger = getLogger('DocumentService');
        super(models, logger);
    }

    add(schemaId, documentIdPart, documentDataPart, schemaPrivateKey, documentPrivateKey) {
        return CryptoUtils.generateInitializationVector(16).then((initializationVector) => {
            return this._models.documentsModel.add(
                schemaId,
                documentIdPart,
                documentDataPart,
                schemaPrivateKey,
                documentPrivateKey,
                initializationVector
            );
        });
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
