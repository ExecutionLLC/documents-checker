const BaseModel = require('./BaseModel');

class DocumentsModel extends BaseModel {
    constructor(chaincodeApi) {
	super(chaincodeApi);
    }

    add(schemaId, documentIdPart, documentDataPart, schemaPrivateKey, documentPrivateKey) {
	const args = [schemaId];
	const transientMap = {
	    DOCUMENT_ID_PART: documentIdPart,
	    DOCUMENT_DATA_PART: documentDataPart,
	    SCHEMA_PRIVATE_KEY: schemaPrivateKey,
	    DOCUMENT_PRIVATE_KEY: documentPrivateKey
	};
	const request = this._chaincodeApi.createInvokeRequest(
	    'createDocument', args, transientMap
	);
	
	return this._chaincodeApi.sendInvokeRequest(request);
    }

    getDataPart(schemaId, documentIdPart, schemaPrivateKey, documentPrivateKey) {
	const args = [schemaId];
	const transientMap = {
	    DOCUMENT_ID_PART: documentIdPart,
	    SCHEMA_PRIVATE_KEY: schemaPrivateKey,
	    DOCUMENT_PRIVATE_KEY: documentPrivateKey
	};
	const request = this._chaincodeApi.createQueryRequest(
	    'readDocument', args, transientMap
	);
	
	return this._chaincodeApi.sendQueryRequest(request);
    }
    
    isExists(schemaId, documentIdPart) {
	const args = [schemaId];
	const transientMap = {
	    DOCUMENT_ID_PART: documentIdPart,
	};
	const request = this._chaincodeApi.createQueryRequest(
	    'isDocumentExists', args, transientMap
	);
	
	return this._chaincodeApi.sendQueryRequest(request);
    }
}

module.exports = DocumentsModel;
