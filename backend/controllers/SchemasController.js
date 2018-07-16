const BaseController = require('./BaseController');
const Express = require('express');

class SchemasController extends BaseController {
    constructor(services) {
	super(services);
    }

    add(request, response) {
	const {schemaId} = request; 
	const {
	    schemaIdPart,
	    schemaDataPart,
	    schemaPrivateKey
	} = request.body;
	this.srvices.schemasService.add(
	    schemaId,
	    schemaIdPart,
	    schemaDataPart,
	    schemaPrivateKey
	).then(() => {
	    this.sendOk(response);
	}).catch((error) => {
	    this.sendError(response, error);
	});
    }

    isExists() {
	const {schemaId} = request; 
	this.srvices.schemasService.isExists(
	    schemaId
	).then(() => {
	    this.sendOk(response);
	}).catch((error) => {
	    this.sendError(response, error);
	});
    }
    
    get(request, response) {
	const {schemaId} = request; 
	const {schemaPrivateKey} = request.body;
	this.srvices.schemasService.getDataPart(
	    schemaId,
	    schemaPrivateKey
	).then((documentDataPart) => {
	    this.sendJson(response, documentDataPart);
	}).catch((error) => {
	    this.sendError(response, error);
	});
    }
    
    createRouter() {
	const router = new Express();

	router.post('/:schemaId', this.add.bind(this));
	router.get('/:schemaId', this.isExists.bind(this));
	router.get('/:schemaId/data', this.get.bind(this));

	return router;
    }
} 

module.exports = SchemasController;
