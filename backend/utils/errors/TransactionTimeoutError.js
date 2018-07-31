const ChaincodeApiError = require('./ChaincodeApiError');

class TransactionTimeoutError extends ChaincodeApiError {
    constructor(message) {
        super(message || 'Timeout expired');
        this.name = 'TransactionTimeoutError';
    }
}

module.exports = TransactionTimeoutError;