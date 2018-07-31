class ChaincodeApiError extends Error {
    constructor(message) {
        super(message || 'Unknown chaincode api error');
        this.name = 'ChaincodeApiError';
    }
}

module.exports = ChaincodeApiError;