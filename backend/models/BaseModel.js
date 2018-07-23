class BaseModel {
    constructor(chaincodeApi, logger) {
        this._chaincodeApi = chaincodeApi;
        this._logger = logger;
    }

    init() {
        return new Promise((resolve, reject)  => {
            this._logger.info('initialized');
            resolve();
        })
    }
}

module.exports = BaseModel;
