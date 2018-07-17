const BaseModel = require('./BaseModel');
const getLogger = require('../utils/log');

class SchemasModel extends BaseModel {
    constructor(chaincodeApi) {
        const logger = getLogger('DocumentsModel');
        super(chaincodeApi, logger);
    }

    add(schemaId, schemaIdPart, schemaDataPart, schemaPrivateKey) {
        const args = [schemaId];
        const transientMap = {
            SCHEMA_ID_PART: schemaIdPart,
            SCHEMA_DATA_PART: schemaDataPart,
            SCHEMA_PRIVATE_KEY: schemaPrivateKey,
        };
        const request = this._chaincodeApi.createInvokeRequest(
            'createSchema', args, transientMap
        );

        return this._chaincodeApi.sendInvokeRequest(request);
    }

    get(schemaId, schemaPrivateKey) {
        const args = [schemaId];
        const transientMap = {
            SCHEMA_PRIVATE_KEY: schemaPrivateKey,
        };
        const request = this._chaincodeApi.createQueryRequest(
            'readSchema', args, transientMap
        );

        return this._chaincodeApi.sendQueryRequest(request);
    }

    isExists(schemaId) {
        const args = [schemaId];
        const request = this._chaincodeApi.createQueryRequest(
            'isSchemaExists', args
        );

        return this._chaincodeApi.sendQueryRequest(request);
    }
}

module.exports = SchemasModel;
