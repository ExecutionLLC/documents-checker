import request from 'request-promise';
import config from './config';
import demoDataTestSchema1 from './demo-data/test-schema1';

const API = {
    _getBaseUrl() {
        return config.API_BASE_URL;
    },

    getSchema(schemaId) {
        if (schemaId === 'test_schema1') {
            return Promise.resolve(demoDataTestSchema1);
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