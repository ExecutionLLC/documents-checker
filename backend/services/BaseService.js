class BaseService {
    constructor(models, logger) {
        this._models = models;
        this._logger = logger;
    }

    start() {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    stop() {
        return new Promise((resolve, reject) => {
            resolve();
        });
    }
}

module.exports = BaseService;
