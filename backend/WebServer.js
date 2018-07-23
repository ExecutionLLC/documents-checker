const bodyParser = require('body-parser');
const cors = require('cors');
const Express = require('express');
const Http = require('http');
const HttpStatusCodes = require('http-status-codes');

const BaseController = require('./controllers/BaseController');
const config = require('./utils/config');
const getLogger = require('./utils/log');

class WebServer {
    constructor(models, services, controllers) {
        this._models = models;
        this._services = services;
        this._controllers = controllers;

        this._httpServer = Http.createServer();

        this._logger = getLogger('WebServer');
    }

    start() {
        return this._services.start().then(() => {
            return this._controllers.createRouter();
        }).then((apiRouter) => {
            return this._createApp(apiRouter);
        }).then((app) => {
            return this._startHttpServer(app);
        });
    }

    stop() {
        return new Promise((resolve, reject) => {
            this._httpServer.close();
            this._services.stop().then(resolve, reject);
        });
    }

    _createApp(apiRouter) {
        return new Promise((resolve, reject) => {
            const app = new Express();

            app.use(bodyParser.json());
            app.use(cors());
            app.use('/', apiRouter);
            app.use(this._handleErrors.bind(this));

            resolve(app);
        });
    }

    _startHttpServer(app) {
        return new Promise((resolve, reject) => {
            const serverPort = config.get('webServerPort') || 3000;
            this._httpServer.on('request', app);
            this._httpServer.listen(serverPort, () => {
                this._logger.info('Server listening on port %d', serverPort);
            });
            resolve();
        })
    }

    _handleErrors(error, request, response, next) {
        BaseController.sendError(response, error);
        const errorMessage = (error && error.message) ? error.message : 'Unknown error';
        this._logger.error('%s %d %s: %s', request.method, response.statusCode, request.url, errorMessage);
        if (error.stack) {
            this._logger.debug(error.stack);
        }
    }
}

module.exports = WebServer;
