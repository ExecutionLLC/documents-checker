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
    }
};

export default API;