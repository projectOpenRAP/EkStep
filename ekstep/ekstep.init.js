let q = require('q');
let {
    createFolderIfNotExists,
    extractFile
} = require('./ekstep.controller.js');
let {
    readdir,
    deleteDir
} = require('../../../filesdk');
let {
    init,
    createAndInitIndex,
    deleteIndex,
    getAllIndices
} = require('../../../searchsdk/index.js');
let {
    startUploadngTelemetry
} = require('./ekstep.telemetry_upload.js');

let config = require('./config.js');

/*
    Reads ecar files from the location defined in config.js and extract them one by one
*/
let processEcarFiles = (filePath) => {
    return readdir(filePath)
        .then(files => {
            return files
                .filter(file => file.endsWith('.ecar'))
                .reduce((chainedExtractPromises, file) => {
                    return chainedExtractPromises.then(
                        () => {
                            console.log(`Extraction of ${file} completed.`);

                            return extractFile(filePath, file);
                        },
                        err => {
                            console.log(`Extraction of ${file} failed.`);
                            console.log(err);

                            return extractFile(filePath, file);
                        });
                }, q.when());
        });
}

/*
    Adds the JSON files to BleveSearch Database
*/
let indexMetaDataIntoBleveDb = () => {
    /*
        Updated behavior: Carpet bomb the index and rebuild from scratch
    */
    return init()
        .then(res => {
            return getAllIndices();
        })
        .then(res => {
            let availableIndices = JSON.parse(res.body).indexes;

            if (availableIndices.indexOf(config.bleve_search.db_name) === -1) {
                return { message: `Creating ${config.plugin_name} index now.` };
            } else {
                return deleteIndex({ indexName: config.bleve_search.db_name });
            }
        })
        .then(res => {
            res.message && console.log(res.message);
            let jsonDir = config.meta_data_dir;
            return createAndInitIndex({ indexName: config.bleve_search.db_name, jsonDir: jsonDir });
        });

}

let initializeEkStepPlugin = () => {
    /*
    initialize telemetry upload
    */
    startUploadngTelemetry();

    createFolderIfNotExists(config.root_dir)
        .then(value => {
            console.log("Created " + config.root_dir);
            return createFolderIfNotExists(`${config.root_dir}/${config.syncthing.marker_file}`);
        })
        .then(value => {
            console.log("Created " + `${config.root_dir}/${config.syncthing.marker_file}`);
            return createFolderIfNotExists(config.telemetry.src_dir);
        })
        .then(value => {
            console.log("Created " + config.telemetry.src_dir);
            return createFolderIfNotExists(config.meta_data_dir);
        })
        .then(value => {
            console.log("Created " + config.meta_data_dir);
            return createFolderIfNotExists(config.ecar_dir);
        })
        .then(value => {
            console.log("Created " + config.ecar_dir);
            return createFolderIfNotExists(config.content_dir);
        })
        .then(value => {
            console.log("Created " + config.content_dir);
            return processEcarFiles(config.root_dir);
        })
        .then(value => {
            return indexMetaDataIntoBleveDb();
        }, reason => {
            console.log(reason);
            console.log("There seem to be corrupt ecar files in the directory.");
            return indexMetaDataIntoBleveDb();
        })
        .then(value => {
            console.log("Initialized API Server");
        })
        .catch(e => {
            console.log(e);
            if (typeof e.state === 'undefined') {
                console.log(e);
                console.log("Could not initialize API Server");
            }
        });
}

module.exports = {
    initializeEkStepPlugin
}