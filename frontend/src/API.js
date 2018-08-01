import request from 'request-promise';
import { Base64 } from 'js-base64';
import config from './config';

const API = {
    _getBaseUrl() {
        return config.API_BASE_URL;
    },

    getSchema(schemaId) {
        const params = {
            headers: {
                'Content-Type': 'application/json',
                'X-Schema-Private-Key': config.SCHEMA_PRIVATE_KEY
            },
            json: true
        };
        return request.get(`${this._getBaseUrl()}schemas/${schemaId}/data`, params)
            .then((data) => {
                if (data &&
                    data.idPart &&
                    data.idPart.jsonSchema &&
                    data.idPart.uiSchema &&
                    data.dataPart &&
                    data.dataPart.jsonSchema &&
                    data.dataPart.uiSchema)
                {
                    return data;
                }
                throw new Error('Malformed schemas');
            });
    },

    addDocument(schemaId, idPart, dataPart) {
        const params = {
            headers: {
                'Content-Type': 'application/json'
            },
            body: {
                schemaPrivateKey: config.SCHEMA_PRIVATE_KEY,
                documentPrivateKey: config.DOCUMENT_PRIVATE_KEY,
                documentIdPart: idPart,
                documentDataPart: dataPart
            },
            json: true
        };
//        return new Promise((resolve, reject) => { setTimeout(() => reject('qwe'), 1000)});
        return request.post(`${this._getBaseUrl()}documents/${schemaId}`, params);
    },

    getDocuments() {
        return request.get(`${this._getBaseUrl()}documents`);
    },

    isDocumentExists(schemaId, idPart) {
        return request.get(
            `${this._getBaseUrl()}documents/${schemaId}`,
            {
                headers: {
                    'X-Document-Id': Base64.encode(JSON.stringify(idPart))
                },
                json: true
            }
        );
    },

    getDocument(schemaId, idPart) {
        return request.get(
            `${this._getBaseUrl()}documents/${schemaId}/data`,
            {
                headers: {
                    'X-Document-Id': Base64.encode(JSON.stringify(idPart)),
                    'X-Schema-Private-Key': config.SCHEMA_PRIVATE_KEY,
                    'X-Document-Private-Key': config.DOCUMENT_PRIVATE_KEY,
                },
                json: true
            }
        );
    }
};

export default API;