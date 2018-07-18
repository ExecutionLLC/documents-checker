const ChaincodeApi = require('../hyperledger-api/ChaincodeApi');
const DocumentsModel = require('./DocumentsModel');
const getLogger = require('../utils/log');
const SchemasModel = require('./SchemasModel');

class ModelsFacade {
    constructor() {
        this._chaincodeApi = new ChaincodeApi();

        this.schemasModel = new SchemasModel(this._chaincodeApi);
        this.documentsModel = new DocumentsModel(this._chaincodeApi);

        this._logger = getLogger('ModelsFacade');
    }

    init() {
        return this._chaincodeApi.init();
    }
}

module.exports = ModelsFacade;
