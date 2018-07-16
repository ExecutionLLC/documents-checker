const FabricClient = require('fabric-client');
const FabricCAClient = require('fabric-ca-client');

const STORE_PATH = './runtime/hfc-key-store';
const CA_SERVER_URL = 'http://localhost:7054';
const CA_SERVER_NAME = 'ca.private.net';
const ORGANIZATION_MSPID = 'Org1MSP';

const ADMIN_ENROLMENT_ID = 'admin';
const ADMIN_ENROLMENT_SECRET = 'adminpw';

const USER_ENROLMENT_ID = 'user1';
const USER_AFFILATION = 'org1.department1';

class KeyStoreInitializer {
    constructor() {
        this._fabricClient = new FabricClient();
        this._fabricCAClient = null;

        this._adminUser = null;
        this._commonUser = null;
    }

    initStore() {
        return this._init().then(() => {
            return this._initAdminUser();
        }).then(() => {
            console.log('Admin user initialized.');
            return this._initCommonUser();
        }).then(() => {
            console.log('Common user initialized.');
        }).catch((error) => {
            console.error('Fatal error:', error);
        });
    }

    _init() {
        return FabricClient.newDefaultKeyValueStore({path: STORE_PATH}).then((stateStore) => {
            this._fabricClient.setStateStore(stateStore);

            const cryptoSuite = FabricClient.newCryptoSuite();
            const cryptoStore = FabricClient.newCryptoKeyStore({path: STORE_PATH});

            cryptoSuite.setCryptoKeyStore(cryptoStore);
            this._fabricClient.setCryptoSuite(cryptoSuite);

            const tlsOptions = {
                trustedRoots: [],
                verify: false
            };

            this._fabricCAClient = new FabricCAClient(CA_SERVER_URL, tlsOptions, CA_SERVER_NAME, cryptoSuite);
        });
    }

    _initAdminUser() {
        const enrollmentOptions = {
            enrollmentID: ADMIN_ENROLMENT_ID,
            enrollmentSecret: ADMIN_ENROLMENT_SECRET
        };

        return this._fabricClient.getUserContext(enrollmentOptions.enrollmentID, true).then((userFromStore) => {
            if (userFromStore && userFromStore.isEnrolled()) {
                this._adminUser = userFromStore;
                return;
            }

            return this._enrollUser(enrollmentOptions).then((user) => {
                this._adminUser = user;
                this._fabricClient.setUserContext(this._adminUser);
            });
        });
    }

    _initCommonUser() {
        const registerOptions = {
            enrollmentID: USER_ENROLMENT_ID,
            affiliation: USER_AFFILATION
        };

        return this._fabricClient.getUserContext(registerOptions.enrollmentID, true).then((userFromStore) => {
            if (userFromStore && userFromStore.isEnrolled()) {
                this._commonUser = userFromStore;
                return;
            }

            return this._fabricCAClient.register(registerOptions, this._adminUser).then((secret) => {
                const enrollmentOptions = {
                    enrollmentID: USER_ENROLMENT_ID,
                    enrollmentSecret: secret
                };

                return this._enrollUser(enrollmentOptions).then((user) => {
                    this._commonUser = user;
                });
            });
        });
    }

    _enrollUser(enrollmentOptions) {
        return this._fabricCAClient.enroll(enrollmentOptions).then((enrollment) => {
            return this._fabricClient.createUser({
                username: enrollmentOptions.enrollmentID,
                mspid: ORGANIZATION_MSPID,
                cryptoContent: {
                    privateKeyPEM: enrollment.key.toBytes(),
                    signedCertPEM: enrollment.certificate
                }
            });
        });
    }
}

const keyStoreInitializer = new KeyStoreInitializer();
keyStoreInitializer.initStore();
