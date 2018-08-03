function equalNum(a, b) {
    return Math.abs(a - b) <= Number.EPSILON;
}

function arraySum(arr) {
    if (!arr || !arr.length) {
        return 0;
    }
    return arr.reduce((a, b) => a + b);
}

const NOTEQUAL = '\u2260';

function validator(idPart, dataPart) {
    const expectedSumVAT = idPart.sumWOVAT + idPart.VAT;
    if (!equalNum(expectedSumVAT, idPart.sumVAT)) {
        return `Sum incorrect, ${idPart.sumWOVAT} + ${idPart.VAT} = ${expectedSumVAT} ${NOTEQUAL} ${idPart.sumVAT}`;
    }
    const operationsValues = dataPart.operations ?
        dataPart.operations.map(operation => operation.valueWOVAT) :
        [];
    const operationsValuesVAT = dataPart.operations ?
        dataPart.operations.map(operation => operation.valueVAT) :
        [];
    const totalValue = arraySum(operationsValues);
    const totalValueVAT = arraySum(operationsValuesVAT);
    if (!equalNum(totalValue, idPart.sumWOVAT)) {
        return `Operations sum incorrect, ${totalValue} ${NOTEQUAL} ${idPart.sumWOVAT}`;
    }
    if (!equalNum(totalValueVAT, idPart.sumVAT)) {
        return `Operations sum with VAT incorrect, ${totalValueVAT} ${NOTEQUAL} ${idPart.sumVAT}`;
    }
    return null;
}

validator.id = 'american_express';

export default validator;
