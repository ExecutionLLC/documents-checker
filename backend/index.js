const ControllersFacade = require('./controllers/ControllersFacade');
const getLogger = require('./utils/log');
const ModelsFacade = require('./models/ModelsFacade');
const ServicesFacade = require('./services/ServicesFacade');
const WebServer = require('./WebServer');

const logger = getLogger('main');

const models = new ModelsFacade();
const services = new ServicesFacade(models);
const controllers = new ControllersFacade(services);

Promise.all([
    models.init(),
    services.init(),
    controllers.init()
]).then(() => {
    const webServer = new WebServer(models, services, controllers);
    return webServer.start();
}).catch((error) => {
    logger.error('(FATAL ERROR) cannot start server: %s', error);
    logger.debug(error.stack);
    process.exit(1);
});