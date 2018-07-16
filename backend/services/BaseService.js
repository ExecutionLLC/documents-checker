class BaseService {
    constructor(models) {
	this._models = models;
    }

    start() {
	return Promise((resolve, reject) => {
	    resolve();
	});
    }

    stop() {
	return Promise((resolve, reject) => {
	    resolve();
	});
    }
}

module.exports = BaseService;
