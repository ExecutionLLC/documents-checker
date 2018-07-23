class BaseService {
    constructor(models, logger) {
        this._models = models;
        this._logger = logger;
    }

    init() {
        return new Promise((resolve, reject)  => {
            this._logger.info('initialized');
            resolve();
        })
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
