const ControllersFacade = require('./controllers/ControllersFacade');
const getLogger = require('./utils/log');
const ModelsFacade = require('./models/ModelsFacade');
const ServicesFacade = require('./services/ServicesFacade');
const WebServer = require('./WebServer');

const logger = getLogger('main');

const models = new ModelsFacade();
const services = new ServicesFacade(models);
const controllers = new ControllersFacade(services);

const webServer = new WebServer(models, services, controllers);

webServer.start().catch((error) => {
    logger.error('(FATAL ERROR) cannot start web server:', error);
    logger.debug(error.stack);
    process.exit(1);
});
