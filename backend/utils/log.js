const config = require('./config');
const winston = require('winston');
const { format } = winston;

const LOGGERS = Object.create(null);

function getLoggerTransports(name) {
    const transports = [];

    const commonPartOfFormat = format.combine(
        format.splat(),
        format.label({ label: name }),
        format.timestamp(),
        format.printf((info) => {
            return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
        })
    );
    const level = config.get('logLevel');

    if (config.get('consoleLog')) {
        transports.push(
            new winston.transports.Console({
                level: level,
                handleException: true,
                format: format.combine(
                    format.colorize(),
                    commonPartOfFormat
                )
            })
        )
    }
    const fileLog = config.get('fileLog');
    if (fileLog) {
        transports.push(
            new winston.transports.File({
                filename: fileLog,
                level: level,
                handleException: true,
                format: commonPartOfFormat
            })
        );
    }

    return transports;
}

function getLogger(name) {
    if (!LOGGERS[name]) {
        LOGGERS[name] = winston.createLogger({
            transports: getLoggerTransports(name),
            exitOnError: false
        });
    }

    return LOGGERS[name];
}

module.exports = getLogger;
