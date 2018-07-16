const BaseController = require('./BaseController');
const Express = require('express');

class DocumentsController extends BaseController {
    constructor(services) {
	super(services);
    }

    add(request, response) {
	const {
	    schemaId,
	    documentIdPart,
	    documentDataPart,
	    schemaPrivateKey,
	    documentPrivateKey
	} = request.body;
	this.srvices.documentsService.add(
	    schemaId,
	    documentIdPart,
	    documentDataPart,
	    schemaPrivateKey,
	    documentPrivateKey
	).then(() => {
	    this.sendOk(response);
	}).catch((error) => {
	    this.sendError(response, error);
	});
    }

    isExists() {
	const {
	    schemaId,
	    documentIdPart
	} = request.body;
	this.srvices.documentsService.add(
	    schemaId,
	    documentIdPart
	).then((result) => {
	    this.sendJson(response, result);
	}).catch((error) => {
	    this.sendError(response, error);
	});
    }
    
    getDataPart(request, response) {
	const {
	    schemaId,
	    documentIdPart,
	    schemaPrivateKey,
	    documentPrivateKey
	} = request.body;
	this.srvices.documentsService.getDataPart(
	    schemaId,
	    documentIdPart,
	    schemaPrivateKey,
	    documentPrivateKey
	).then((documentDataPart) => {
	    this.sendJson(response, documentDataPart);
	}).catch((error) => {
	    this.sendError(response, error);
	});
    }
    
    createRouter() {
	const router = new Express();

	router.post('/', this.add.bind(this));
	router.get('/', this.isExists.bind(this));
	router.get('/data', this.getDataPart.bind(this));

	return router;
    }
} 
