import request from 'request-promise';
import config from './config';

const API = {
    _getBaseUrl() {
        return config.API_BASE_URL;
    },

    getSchema(schemaId) {
        if (schemaId === 't') {
            return Promise.resolve({
                idPart: {
                    "title": "Акт",
                    "type": "object",
                    "required": [],
                    "properties": {
                        "date": {
                            "type": "string",
                            "title": "Дата"
                        },
                        "number": {
                            "type": "string",
                            "title": "Номер"
                        },
                        "producer": {
                            "type": "string",
                            "title": "Поставщик"
                        },
                        "consumer": {
                            "type": "string",
                            "title": "Покупатель"
                        },
                        "desc": {
                            "type": "string",
                            "title": "Краткое описание услуг"
                        },
                        "sumWOVAT": {
                            "type": "integer",
                            "title": "Сумма Акта без НДС"
                        },
                        "VAT": {
                            "type": "integer",
                            "title": "Сумма НДС"
                        },
                        "sumWVAT": {
                            "type": "integer",
                            "title": "Сумма с НДС"
                        }
                    },
                },
                dataPart: {
                    "title": "Акт",
                    "type": "object",
                    "properties": {
                        "postingDate": {
                            "type": "string",
                            "title": "Дата списывания"
                        },
                        "transactionDate": {
                            "type": "string",
                            "title": "Дата операции"
                        },
                        "transactionDescription": {
                            "type": "string",
                            "title": "Описание операции"
                        },
                        "transactionReferenceNumber": {
                            "type": "string",
                            "title": "Номер транзакции"
                        },
                        "amountTransaction": {
                            "type": "integer",
                            "title": "Сумма в валюте операции"
                        },
                        "amountAccount": {
                            "type": "integer",
                            "title": "Сумма в валюте счёта"
                        },
                    }
                },
            });
        }
        const params = {
            headers: {
                'Content-Type': 'application/json',
                'X-Schema-Private-Key': '5gS/gVxbfwx/i3sKNdv0HEoELdCXj1Sw1ADcOEuLqwY='
            },
            json: true
        };
        return request.get(`${this._getBaseUrl()}schemas/${schemaId}/data`, params);
    },

    addDocument(schemaId, idPart, dataPart) {
        const params = {
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                schemaPrivateKey: '5gS/gVxbfwx/i3sKNdv0HEoELdCXj1Sw1ADcOEuLqwY=',
                documentPrivateKey: 'Oo32Wk5kZ3/FTeG8nvx2jK/dRXiwA2huR0ogF+fMgDc=',
                documentIdPart: idPart,
                documentDataPart: dataPart
            },
            json: true
        };
        return request.post(`${this._getBaseUrl()/*'http://localhost:3000/'*/}documents/${schemaId}`, params);
    },

    getDocuments() {
        return request.get(`${this._getBaseUrl()}documents`);
    },

    isDocumentExists(schemaId, idPart) {
        return request.get(
            `${this._getBaseUrl()}documents/${schemaId}`,
            {
                headers: {
                    'X-Document-Id': JSON.stringify(idPart)
                },
                json: true
            }
        );
    }
};

export default API;