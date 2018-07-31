import request from 'request-promise';
import config from './config';

const API = {
    _getBaseUrl() {
        return config.API_BASE_URL;
    },

    getSchema(schemaId) {
        const params = {
            headers: {
                'Content-Type': 'application/json',
                'X-Schema-Private-Key': '5gS/gVxbfwx/i3sKNdv0HEoELdCXj1Sw1ADcOEuLqwY='
            },
            json: true
        };
        return request.get(`${this._getBaseUrl()}schemas/${schemaId}/data`, params)
            .then((data) => {
                if (data &&
                    data.idPart &&
                    data.idPart.JSONSchema &&
                    data.idPart.UISchema &&
                    data.dataPart &&
                    data.dataPart.JSONSchema &&
                    data.dataPart.UISchema)
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
                schemaPrivateKey: '5gS/gVxbfwx/i3sKNdv0HEoELdCXj1Sw1ADcOEuLqwY=',
                documentPrivateKey: 'Oo32Wk5kZ3/FTeG8nvx2jK/dRXiwA2huR0ogF+fMgDc=',
                documentIdPart: idPart,
                documentDataPart: dataPart
            },
            json: true
        };
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
                    'X-Document-Id': JSON.stringify(idPart)
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
                    'X-Document-Id': JSON.stringify(idPart),
                    'X-Schema-Private-Key': '5gS/gVxbfwx/i3sKNdv0HEoELdCXj1Sw1ADcOEuLqwY=',
                    'X-Document-Private-Key': 'Oo32Wk5kZ3/FTeG8nvx2jK/dRXiwA2huR0ogF+fMgDc=',
                },
                json: true
            }
        );
    }
};

export default API;