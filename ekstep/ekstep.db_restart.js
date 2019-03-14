let {
    init,
    createIndex,
    deleteIndex,
    getAllIndices
} = require('../../../searchsdk/index.js');

let config = require('./config.js');

let initializeEsDB = () => {
    return init()
        .then(res => {
            return getAllIndices();
        })
        .then(res => {
            let availableIndices = JSON.parse(res.body).indexes;

            if (availableIndices.indexOf(config.bleve_search.db_name) === -1) {
                return { message : 'Creating ekstep index now.' };
            } else {
                return deleteIndex({ indexName : config.bleve_search.db_name });
            }
        })
        .then(res => {
            res.message && console.log(res.message);
            return createIndex({ indexName : config.bleve_search.db_name });
        });
}

module.exports = {
    initializeEsDB
}