const HttpStatusCodes = require('http-status-codes');

class BaseController {
    constructor(services) {
	this._services = services; 
    }

    sendOk(response) {
	response
	    .status(HttpStatusCodes.OK)
	    .end();
    }

    sendJson(response, data) {
	response
	    .json(data)
	    .end();
    }

    sendError(response, error, errorHttpCode) {
	response
	    .status(errorHttpCode || HttpStatusCodes.INTERNAL_SERVER_ERROR)
	    .json(error)
	    .end();
    }
}

module.exports = BaseController;
