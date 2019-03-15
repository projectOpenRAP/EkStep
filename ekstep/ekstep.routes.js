let {
    initializeEkStepPlugin
} = require('./ekstep.init.js');
let {
    getHomePage,
    getEcarById,
    performSearch,
    telemetryData
} = require('./ekstep.controller.js');

module.exports = app => {
    /*
        ekstep API endpoints
    */
    app.post('/api/data/v1/page/assemble', getHomePage);
    app.get('/api/content/v1/read/:contentID', getEcarById);
    app.post('/api/data/v1/telemetry', telemetryData);
    app.post('/api/composite/v1/search', performSearch);

    initializeEkStepPlugin();
}
