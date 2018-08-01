const BaseService = require('./BaseService');
const CryptoUtils = require('../utils/crypto');
const getLogger = require('../utils/log');
const NotFoundError = require('../utils/errors/NotFoundError');
const ConflictError = require('../utils/errors/ServerError');

class SchemasService extends BaseService {
    constructor(models) {
        const logger = getLogger('SchemasService');
        super(models, logger);
    }

    add(schemaId, schemaIdPart, schemaDataPart, schemaPrivateKey) {
        return this._models.schemasModel.isExists(schemaId).then((isExists) => {
            if (isExists) {
                throw new ConflictError('Schema already exists');
            }

            return CryptoUtils.generateInitializationVector(16);
        }).then((initializationVector) => {
            return this._models.schemasModel.add(
                schemaId,
                schemaIdPart,
                schemaDataPart,
                schemaPrivateKey,
                initializationVector
            );
        });
    }

    get(schemaId, schemaPrivateKey) {
        return this._models.schemasModel.isExists(schemaId).then((isExists) => {
            if (!isExists) {
                throw new NotFoundError('Schema not found');
            }

            return this._models.schemasModel.get(
                schemaId,
                schemaPrivateKey
            );
        });
    }

    isExists(schemaId) {
        return this._models.schemasModel.isExists(schemaId);
    }
}

module.exports = SchemasService;
