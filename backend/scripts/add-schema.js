const fs = require('fs');
const request = require('request-promise');

const {argv} = process;

function printUsage() {
    console.log('node add-schema.js {SERVER_URL} {SCHEMA_ID} {SCHEMA_PRIVATE_KEY} {PATH_TO_SCHEMA}');
}

if (argv.length !== 6) {
    console.error('argv.length !== 6');
    printUsage();
} else {
    const serverUrl = argv[2];
    const schemaId = argv[3];
    const schemaPrivateKey = argv[4];
    const pathToSchema = argv[5];

    const schema = JSON.parse(fs.readFileSync(pathToSchema, 'utf8'));
    request({
        method: 'POST',
        uri: serverUrl + '/schemas/' + schemaId,
        headers: {
            "content-type": "application/json",
        },
        json: {
            schemaId,
            schemaIdPart: schema['idPart'],
            schemaDataPart: schema['dataPart'],
            schemaPrivateKey
        }
    }).then((response) => {
        console.log('OK');
    }).catch((error) => {
        console.error('GOT ERROR:');
        console.error(error);
    });
}