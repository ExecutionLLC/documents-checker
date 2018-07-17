class BaseModel {
    constructor(chaincodeApi, logger) {
        this._chaincodeApi = chaincodeApi;
        this._logger = logger;
    }
}

module.exports = BaseModel;
