class BaseService {
    constructor(models, logger) {
        this._models = models;
        this._logger = logger;
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
