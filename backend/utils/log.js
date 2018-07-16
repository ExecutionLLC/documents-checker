const winston = require('winston');
const config = require('./config');

const LOGGERS = Object.create(null);

function getLoggerTransports(name) {
    const level = config.get('logLevel');

    const transports = [];
    if (config.get('consoleLog')) {
        transports.push(
            new winston.transports.Console({
                level: level,
                label: name,
                handleException: true,
                json: false,
                colorize: true
            })
        )
    }
    const fileLog = config.get('fileLog');
    if (fileLog) {
        transports.push(
            new winston.transports.File({
                filename: fileLog,
                level: level,
                label: name,
                handleException: true,
                json: false
            })
        );
    }

    return transports;
}

function getLogger(name) {
    if (!LOGGERS[name]) {
        LOGGERS[name] = new winston.Logger({
            transports: getLoggerTransports(name),
            exitOnError: false
        });
    }

    return LOGGERS[name];
}

module.exports = getLogger;
