const nconf = require('nconf');
const changeCase = require('change-case');

const ENV_VARIABLES_PREFIX = 'DOCUMENT_CHECKER_';

function transformEnvVariable(keyValueObj) {
    const {key, value} = keyValueObj;
    const minKeyLength = ENV_VARIABLES_PREFIX.length + 1;
    if (!key || !key.startsWith(ENV_VARIABLES_PREFIX) || key.length < minKeyLength) {
        return false;
    }

    return {
        key: changeCase.camelCase(key.slice(ENV_VARIABLES_PREFIX.length)),
        value
    };
}

nconf.argv().env({
    transform: transformEnvVariable,
    parseValues: true
}).file({
    file: 'default-config.json'
});

module.exports = nconf;
