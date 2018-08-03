import americanExpress from './americanExpress';

const validators = [
    americanExpress,
];

function nullValidator() {
    console.log('nullValidator', arguments);
    return null;
}

function validate(validatorId, idPart, dataPart) {
    console.log('validate find', validatorId);
    const schemeValidator = validators.find(validator => validator.id === validatorId);
    const validator = schemeValidator || nullValidator;
    return validator(idPart, dataPart);
}

export default validate;
