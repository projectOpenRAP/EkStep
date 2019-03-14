let multiparty = require('connect-multiparty');
let multipartMiddle = multiparty();
let fs = require('fs');
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
    exec
} = require('child_process');
let {
    initializeEsDB
} = require('./ekstep.db_restart.js');
let {
    addDocument
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
let jsonDocsToDb = (dir) => {
    let defer = q.defer();
    
    /*
        Updated behavior: Carpet bomb the index and rebuild from scratch
    */
    initializeEsDB().then(value => {
        console.log("Index successfully recreated");
        let promises = [];
        fs.readdir(dir, (err, files) => {
            if (err) {
                return defer.reject(err);
            } else {
                for (let i = 0; i < files.length; i++) {
                    if (files[i].lastIndexOf('.json') + '.json'.length === files[i].length) {
                        promises.push(addDocument({
                            indexName: config.bleve_search.db_name,
                            documentPath: dir + files[i]
                        }))
                    }
                }
                q.allSettled(promises).then(values => {
                    values.forEach(value => {
                        if (typeof value.value.err !== 'undefined') {
                            console.log("Error encountered!")
                            return defer.reject(value.value.err);
                        }
                    });
                    return defer.resolve(values[0].value.success);
                });
            }
        });
    }).catch(e => {
        defer.reject(e);
    });
    return defer.promise;
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
        }).then(value => {
            console.log("Created " + `${config.root_dir}/${config.syncthing.marker_file}`);
            return createFolderIfNotExists(config.telemetry.src_dir);
        }).then(value => {
            console.log("Created " + config.telemetry.src_dir);
            return createFolderIfNotExists(config.meta_data_dir);
        }).then(value => {
            console.log("Created " + config.meta_data_dir);
            return createFolderIfNotExists(config.ecar_dir);
        }).then(value => {
            console.log("Created " + config.ecar_dir);
            return createFolderIfNotExists(config.content_dir);
        }).then(value => {
            console.log("Created " + config.content_dir);
            return processEcarFiles(config.root_dir);
        }).then(value => {
            return jsonDocsToDb(config.meta_data_dir);
        }, reason => {
            console.log(reason);
            console.log("There seem to be corrupt ecar files in the directory.");
            return jsonDocsToDb(config.meta_data_dir);
        }).then(value => {
            console.log("Initialized API Server");
        }).catch(e => {
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