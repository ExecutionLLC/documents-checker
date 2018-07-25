const EventEmitter = require('events');
const FabricClient = require('fabric-client');
const HttpStatusCodes = require('http-status-codes');

const config = require('../utils/config');
const getLogger = require('../utils/log');

const DEFAULT_TRANSACTION_TIMEOUT_MS = 30*1000;

const ENDORSER_TRANSACTION_CODE = 3;
const METADATA_VALIDATION_CODES_INDEX = 2;
const TX_STATUS_VALID = 'VALID';
const TX_STATUS_VALID_CODE = 0;

class ChaincodeApiError extends Error {
    constructor(message) {
        super(message || 'Unknown chaincode api error');
        this.name = 'ChaincodeApiError';
    }
}

class TransactionTimeoutError extends ChaincodeApiError {
    constructor(message) {
        super(message || 'Timeout expired');
        this.name = 'TransactionTimeoutError';
    }
}

class ChaincodeApi extends EventEmitter {
    constructor() {
        super();

        this._logger = getLogger('ChaincodeApi');

        this._fabricClient = new FabricClient();
        this._channel = this._fabricClient.newChannel(config.get('channel'));
        const peer = this._fabricClient.newPeer(config.get('peer'));
        this._channel.addPeer(peer);
        const orderer = this._fabricClient.newOrderer(config.get('orderer'));
        this._channel.addOrderer(orderer);
        this._chaincodeId = config.get('chaincodeId');

        this._eventHub = null;

        this._storePath = config.get('storePath');
        this._userName = config.get('userName');
    }

    init() {
        return FabricClient.newDefaultKeyValueStore({path: this._storePath}).then((storeState) => {
            this._fabricClient.setStateStore(storeState);

            const cryptoSuite = FabricClient.newCryptoSuite();
            const cryptoStore = FabricClient.newCryptoKeyStore({path: this._storePath});
            cryptoSuite.setCryptoKeyStore(cryptoStore);
            this._fabricClient.setCryptoSuite(cryptoSuite);

            this._logger.info('Store successfully loaded');

            // get the enrolled user from persistence, this user will sign all requests
            return this._fabricClient.getUserContext(this._userName, true);
        }).then((user) => {
            if (user && user.isEnrolled()) {
                this._logger.info('User loaded from store');
                this._user = user;
            } else {
                throw new Error('Failed to get user');
            }

            this._eventHub = this._fabricClient.newEventHub();
            this._eventHub.setPeerAddr(config.get('eventhub'));
            this._eventHub.registerBlockEvent(
                (block) => this._onBlockEvent(block),
                (error) => this._onEventHubError(error)
            );
            this._eventHub.connect();
        });
    }

    _parseAndEmitChaincodeEvents(block) {
        const envelopeDataArray = block.data.data;
        const validationCodeArray = block.metadata.metadata[METADATA_VALIDATION_CODES_INDEX];

        envelopeDataArray.forEach((envelope, index) => {
            if (validationCodeArray[index] !== TX_STATUS_VALID_CODE) {
                // we handle only valid transactions
                return;
            }

            const envelopePayload = envelope.payload;
            const channelHeader = envelopePayload.header.channel_header;

            if (channelHeader.type === ENDORSER_TRANSACTION_CODE) {
                const transaction = envelopePayload.data;
                const chaincodeActionPayload = transaction.actions[0].payload;
                const proposalResponsePayload = chaincodeActionPayload.action.proposal_response_payload;
                const transactionEvent = proposalResponsePayload.extension.events;

                if (transactionEvent && transactionEvent.chaincode_id) {
                    this._onChaincodeEvent(transactionEvent);
                }
            }
        }, this);
    }

    _onBlockEvent(block) {
        this._logger.debug('got new block event: %o', block.header);
        const {number: blockNumber, data_hash: blockHash, previous_hash: prevBlockHash} = block.header;
        this.emit('BLOCK_EVENT', blockNumber, blockHash, prevBlockHash);

        this._parseAndEmitChaincodeEvents(block);
    }

    _onTransactionEvent(transactionId, transactionStatus) {
        this._logger.info('got new transaction event: %s %s', transactionId, transactionStatus);
        this.emit('TRANSACTION_EVENT', transactionId, transactionStatus);
    }

    _onChaincodeEvent(chaincodeEventObj) {
        const {event_name: chaincodeEventName, payload} = chaincodeEventObj;
        const chaincodeEventData = JSON.parse(payload.toString());
        this._logger.info('got new chaincode event (%s): %o', chaincodeEventName, chaincodeEventData);
        this.emit('CHAINCODE_EVENT', chaincodeEventName, chaincodeEventData);
    }

    _onEventHubError(error) {
        this._logger.error('got event hub error: %o', error);
        process.exit(1);
    }

    _sendProposal(request) {
        return this._channel.sendTransactionProposal(request).then(([proposalResponses, proposal]) => {
            if (!proposalResponses || proposalResponses.length === 0) {
                throw new ChaincodeApiError('Proposal response is empty');
            }

            let numberOfValidResponses = 0;
            proposalResponses.forEach((response) => {
                if (response instanceof Error) {
                    this._logger.warn('found error in proposal responses: %o', response);
                } else if (!response.response) {
                    this._logger.warn('found empty proposal response');
                } else if (response.response.status !== HttpStatusCodes.OK) {
                    const statusCode = response.response.status;
                    this._logger.warn('found proposal response with status code != OK (code == %d)', statusCode);
                } else {
                    ++numberOfValidResponses;
                }
            });

            if (numberOfValidResponses === 0) {
                throw new ChaincodeApiError('All proposal responses contain errors');
            }

            return {
                proposalResponses,
                proposal
            };
        });
    }

    _sendTransaction(transactionId, proposalResult, waitTransactionStatus, timeout) {
        return new Promise((resolve, reject) => {
            let resultReturned = false;
            const timeoutHandle = waitTransactionStatus ?
                setTimeout(() => {
                    resultReturned = true;
                    reject(new TransactionTimeoutError());
                }, timeout) : null;

            const onSuccessEvent = (ignored, transactionStatus) => {
                this._onTransactionEvent(transactionId, transactionStatus);
                this._eventHub.unregisterTxEvent(transactionId);
                clearTimeout(timeoutHandle);

                if (!resultReturned && waitTransactionStatus) {
                    if (transactionStatus === TX_STATUS_VALID) {
                        resolve(transactionId);
                    } else {
                        const message = `Transaction status is not "VALID" (status == ${transactionStatus})`;
                        reject(new ChaincodeApiError(message));
                    }
                }
            };
            const onErrorEvent = (error) => {
                this._eventHub.unregisterTxEvent(transactionId);
                clearTimeout(timeoutHandle);

                if (!resultReturned && waitTransactionStatus) {
                    reject(new ChaincodeApiError('Unexpected event hub error (' + error + ')'));
                }
            };
            this._eventHub.registerTxEvent(transactionId, onSuccessEvent, onErrorEvent);
            this._channel.sendTransaction(proposalResult).then(() => {
                this._logger.info('transaction "%s" successfully sent', transactionId);
                if (!waitTransactionStatus) {
                    resolve(transactionId);
                }
            }).catch((error) => {
                this._eventHub.unregisterTxEvent(transactionId);
                clearTimeout(timeoutHandle);
                reject(error);
            });
        });
    }

    static _normalizeTransientMap(transientMap) {
        if (!transientMap) {
            return transientMap;
        }

        const result = {};
        Object.keys(transientMap).forEach((key) => {
            const value = transientMap[key];
            if (typeof value === 'string' || value instanceof String) {
                result[key] = value;
            } else if (value instanceof Buffer) {
                result[key] = value.toString('base64');
            } else if (value instanceof Object) {
                const json = JSON.stringify(value);
                result[key] = Buffer.from(json).toString('base64');
            } else {
                throw new Error('transient value must be string, or Object, or Buffer');
            }
        });

        return result;
    }

    createQueryRequest(functionName, args, transientMap) {
        return {
            chaincodeId: this._chaincodeId,
            fcn: functionName,
            args,
            transientMap: ChaincodeApi._normalizeTransientMap(transientMap)
        };
    }

    sendQueryRequest(request) {
        return this._channel.queryByChaincode(request).then((response) => {
            if (response && response.length === 1) {
                if (response[0] instanceof Error) {
                    throw response[0];
                }

                const jsonString = response[0].toString();
                if (!jsonString) {
                    return null;
                }

                return JSON.parse(jsonString);
            } else {
                throw new ChaincodeApiError('Query response is empty');
            }
        });
    }

    createInvokeRequest(functionName, args, transientMap) {
        const txId = this._fabricClient.newTransactionID();
        return {
            chainId: this._channel.getName(),
            chaincodeId: this._chaincodeId,
            fcn: functionName,
            txId,
            args,
            transientMap: ChaincodeApi._normalizeTransientMap(transientMap)
        };
    }

    sendInvokeRequest(request, waitTransactionStatus) {
        return this._sendProposal(request).then((proposalResult) => {
            const transactionId = request.txId.getTransactionID();
            return this._sendTransaction(
                transactionId,
                proposalResult,
                waitTransactionStatus,
                DEFAULT_TRANSACTION_TIMEOUT_MS
            );
        });
    }
}

module.exports = ChaincodeApi;
