const ChaincodeApi = require('../hyperledger-api/ChaincodeApi')
const SchemasModel = require('./SchemasModel');
const DocumentsModel = require('./DocumentsModel');

class ModelsFacade {
    constructor() {
	this._chaincodeApi = new ChainCodeApi();
	
	this.schemasModel = new SchemasModel(this._chaincodeApi);
	this.documentsModel = new DocumentsModel(this._chaincodeApi);
    }
}

module.exports = ModelsFacade;
