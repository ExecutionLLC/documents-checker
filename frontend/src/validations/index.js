import americanExpress from './americanExpress';

const validators = [
    americanExpress,
];

function nullValidator() {
    return null;
}

function validate(validatorId, idPart, dataPart) {
    const schemeValidator = validators.find(validator => validator.id === validatorId);
    const validator = schemeValidator || nullValidator;
    return validator(idPart, dataPart);
}

export default validate;
