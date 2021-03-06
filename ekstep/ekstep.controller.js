let q = require('q');
let {
    extractZip,
    deleteDir,
    readdir,
    getInfo
} = require('../../../filesdk');
let fs = require('fs');
let {
    init,
    createIndex,
    addDocument,
    deleteIndex,
    deleteDocument,
    getDocument,
    count,
    search,
    getAllIndices,
    advancedSearch
} = require('../../../searchsdk/index.js');
let {
    insertFields
} = require('../../../dbsdk');
let baseInt = 0;
const defaultDbName = 'device_mgmt';
const defaultTableName = 'ecars';
const uuidv4 = require('uuid/v4');

let config = require('./config.js');

let addEcarToDb = (id, type, size, parentId) => {
    let values = [id, type, size, parentId];
    values.filter(item => item !== undefined && item !== null);

    let queryObject = {
        dbName: defaultDbName,
        tableName: defaultTableName,
        columns: ['id', 'type', 'size', 'parent_id'],
        values
    }
    return insertFields(queryObject);
}

/*
    Loads the response structure skeleton of each and every file
*/
let loadSkeletonJson = (jsonFileName) => {
    let defer = q.defer();
    fs.readFile(`/opt/opencdn/appServer/plugins/ekstep/${jsonFileName}.json`, (err, data) => {
        if (err) {
            return defer.reject({
                err
            });
        } else {
            let parsedData = JSON.parse(data);
            return defer.resolve({
                data: parsedData
            });
        }
    });
    return defer.promise;
}

/*
    Removes the preceding attributes from the keys to conform to response structure
    Also modifies cdn url to point to appropriate location for resources
*/
let cleanKeys = (fieldList) => {
    let defer = q.defer();
    let plurals = {
        Story: "Stories",
        Collection: "Collections",
        Game: "Games",
        Worksheet: "Worksheets",
        Plugin: "Plugins",
        Template: "Templates",
        Resource: "Resources",
        TextBook: "Textbooks",
    };

    let remainingAllowedKeys = [
        "appIcon",
        "pkgVersion",
        "board",
        "medium",
        "publisher",
        "me_totalRatings",
        "me_averageRating",
        "me_totalDownloads",
        "copyright",
        "license",
        "expires",
        "downloadUrl",
        "variants",
        "artifactUrl",
        "language",
        "gradeLevel",
        "resourceType",
        "artifactMimeType",
        "contentEncoding",
        "contentDisposition",
        "contentTypesCount",
        "channel",
        "screenshots",
        "audience",
        "pragma",
        "attributions",
        "dialcodes",
        "childNodes",
        "contentType",
        "createdBy",
        "createdOn",
        "creator",
        "description",
        "identifier",
        "lastPublishedOn",
        "mimeType",
        "name",
        "osId",
        "owner",
        "size",
        "status",
        "subject",
        "versionKey"
    ];

    let keysPointingToUrls = [
        'appIcon',
        'artifactUrl',
        'downloadUrl',
        'posterImage',
    ];

    let keysWIthListValues = [
        'ageGroup',
        'domain',
        'gradeLevel',
        'language',
        'organization',
        'audience',
        'os',
        'tags',
        'attributions',
        'childNodes',
        'dialcodes',
        'screenshots',
        'pragma'
    ];

    let newFieldList = {};

    try {
        let cdnUrl = config.cdn_url;
        for (let key in fieldList) {
            if (fieldList[key] === null) {
                continue;
            }
            if (typeof fieldList[key] === 'object') {
                fieldList[key] = fieldList[key][0];
            }
            let newKey = key.slice(key.lastIndexOf(".") + 1);
            if (keysWIthListValues.indexOf(newKey) !== -1 && typeof fieldList[key] !== 'object') {
                newFieldList[newKey] = [fieldList[key]];
            } else if (keysPointingToUrls.indexOf(newKey) !== -1) {
                let value = fieldList[key];
                let newValue = value;
                if (value === null || value.search('https://www.youtube.com') !== -1) {
                    newValue = value;
                } else if (value.search(/^http(s?):\/\/(((\w|\d)+)\.)+(\w|\d)+/) !== -1) {
                    newValue = value.replace(/^http(s?):\/\/(((\w|\d)+)\.)+(\w|\d)+/, cdnUrl);
                } else if (newKey === 'posterImage' || newKey === 'appIcon' || newKey === 'artifactUrl' || newKey === 'downloadUrl') {
                    newValue = cdnUrl + '/xcontent/' + value;
                } else {
                    newValue = cdnUrl + '/' + value;
                }
                newFieldList[newKey] = newValue;
            } else {
                newFieldList[newKey] = fieldList[key];
            }
        }
        contentType = plurals[newFieldList.contentType];
        // Add objType to fields
        let objType = newFieldList.objectType;
        newFieldList = {
            ...newFieldList,
            objType
        };
        defer.resolve({
            fields: newFieldList,
            contentType
        });
    }
    catch (err) {
        console.log("Corrupt JSON file!");
        defer.reject({ err });
    }

    return defer.promise;
}

/*
    Combines all the results and sends them for cleaning
*/
let parseResults = (values) => {
    let defer = q.defer();
    let fields = values.map(value => (JSON.parse(value.value.body).fields));
    let fieldPromises = [];

    for (let i = 0; i < fields.length; i++) {
        fieldPromises.push(cleanKeys(fields[i]));
    }
    q.allSettled(fieldPromises)
        .then(values => {
            return defer.resolve({
                responses: values.map(value => value.value)
            });
        })
        .catch(err => {
            console.log(err);
            return defer.reject({
                err
            });
        });
    return defer.promise;
}

/*
    Identifies the documents that solve a query and extracts all metadata from them
*/
let doThoroughSearch = (queryString, Limit, Offset) => {
    let defer = q.defer();

    let searchPromise;

    if (typeof queryString !== 'object') {
        searchPromise = search({
            indexName: config.bleve_search.db_name,
            searchString: queryString,
            limit : Limit,
	        offset : Offset
        });
    } else {
        searchPromise = advancedSearch({
            indexName: config.bleve_search.db_name,
            query: queryString
        });
    }
    searchPromise
        .then(value => {
            let defer2 = q.defer();
            let hitPromises = [];
            let hits = JSON.parse(value.body).hits;
            for (let i in hits) {
                let id = hits[i].id;
                hitPromises.push(getDocument({
                    indexName: config.bleve_search.db_name,
                    documentID: id
                }));
            }
            q.allSettled(hitPromises)
                .then(values => {
                    return defer2.resolve((parseResults(values)));
                })
            return defer2.promise;
        })
        .then(value => {
            return defer.resolve(value);
        })
        .catch(err => {
            console.log("Error at search: " + JSON.stringify(err));
            return defer.reject({
                err
            });
        });
    return defer.promise;
}

/*
    Grabs data pertaining to facets and processes them in order to conform to standards
*/
let crunchFacets = (facets) => {
    let defer = q.defer();
    let facetResult = {}
    for (let key in facets) {
        let facetObject = {};
        let values = facets[key];
        for (let i in values) {
            if (Object.keys(facetObject).indexOf(values[i]) !== -1) {
                facetObject[values[i]] += 1;
            } else {
                facetObject[values[i]] = 1;
            }
        }
        facetResult[key] = facetObject;
    }
    defer.resolve({
        facetResult
    });
    return defer.promise;
}

/*
    Begins the facet crunching process by sorting results based on their values for each facet
*/
let performCounting = (results, facets) => {
    let defer = q.defer();
    if (typeof facets === 'undefined') {
        defer.resolve({
            results,
            facets: []
        });
        return defer.promise;
    }
    let responseStructure = {};
    facets.forEach(facet => {
        responseStructure[facet] = [];
    });
    results.forEach(result => {
        facets.forEach(facet => {
            responseStructure[facet].push(result[facet]);
        });
    });
    crunchFacets(responseStructure)
        .then(value => {
            let facetResult = value.facetResult;
            let facetResultAsList = [];
            for (let key in facetResult) {
                let keyObject = [];
                for (let key2 in facetResult[key]) {
                    keyObject.push({
                        name: key2,
                        count: facetResult[key][key2]
                    });
                }
                facetResultAsList.push({
                    values: keyObject,
                    name: key
                });
            }
            return defer.resolve({
                results,
                facets: facetResultAsList
            });
        })
        .catch(e => {
            return defer.reject({
                err: e
            });
        });
    return defer.promise;
}

let generateResponseStructure = (rSt) => {
    let defer = q.defer();
    let secs = rSt.result.response.sections;
    let cacheQuery;

    secs = secs.map(sec => {
        let search = sec.searchQuery;

        let strDisplay = JSON.stringify(sec.display);
        let searchQuery = JSON.stringify(sec.searchQuery);

        if (!search) {
            searchQuery = cacheQuery;
        } else {
            cacheQuery = searchQuery;
        }

        return {
            ...sec,
            display: strDisplay,
            name: sec.display.name.en,
            searchQuery: searchQuery
        };
    });

    rSt.result.response.sections = secs;

    defer.resolve({
        responseStructure: rSt
    });
    return defer.promise;
}

let doSectionwiseSearch = (sectionObject) => {
    let queryObject = {
        "conjuncts": []
    }

    for (let key in sectionObject) {
        if (key !== "compatibilityLevel") {
            if (typeof sectionObject[key] === "object") {
                let disjuncts = [];
                for (let i in sectionObject[key]) {
                    disjuncts.push({
                        "field": "archive.items." + key,
                        "match_phrase": "" + sectionObject[key][i]
                    });
                }

                if (disjuncts.length > 0) {   
                    queryObject.conjuncts.push({ disjuncts });
                }
            }
            else {
                field = {
                    "field": "archive.items." + key,
                    "match_phrase": "" + sectionObject[key]
                }
            }
        }
    }

    searchPromise = advancedSearch({
        indexName: config.bleve_search.db_name,
        query: queryObject
    });
    return searchPromise;
}

let resolvePromises = (responsePromiseList) => {
    let defer = q.defer();
    let hitPromises = [];
    let hits = JSON.parse(responsePromiseList.body).hits;
    let total_hits = JSON.parse(responsePromiseList.body).total_hits;
    for (let i in hits) {
        let id = hits[i].id;
        hitPromises.push(getDocument({
            indexName: config.bleve_search.db_name,
            documentID: id
        }));
    }

    q.allSettled(hitPromises)
        .then(values => {
            return defer.resolve((parseResults(values)));
        })
    return defer.promise;

}


let getHomePage = (req, res) => {
    /*
        request body structure :
        {
            request: {  
                filters: { 
                    board: [Array],
                    compatibilityLevel: [Object],
                    gradeLevel: [Array],
                    medium: [Array] 
                },
                mode: 'string',
                name: 'string',
                source: 'string' 
            }
        }
    */
    let defer = q.defer();
    let parsedReq = req.body;
    let reqConfig = parsedReq.request.name;
    let loadedJson = {};
    let responseStructure = {};
    let query = [];
    let section = [];
    let sectionResponse = {};
    let sectionNames = [];
    loadSkeletonJson(`${config.app_pages}/${reqConfig}`)
        .then(value => {
            loadedJson = value.data;
            let deviceId = parsedReq.id;
            let ets = parsedReq.ets;
            let request = parsedReq.request;
            let name = request.name;
            let ver = parsedReq.ver;
            let filters = request.filters;
            let configFilters = {};
            let bulkPromises = [];
            let sectionResponsePromises = [];
            let sections = loadedJson.response.sections;
            let sectionResponse = [];
            for (let i in sections) {
                let sectionObject = {};
                sectionNames[i] = sections[i].display.name.en;
                configFilters = sections[i].searchQuery.request.filters;
                for (let key in filters) {
                    sectionObject[key] = filters[key];
                }
                for (let key in configFilters) {
                    sectionObject[key] = configFilters[key];
                }
                sectionResponsePromises.push(doSectionwiseSearch(sectionObject));
            }
            return q.all(sectionResponsePromises);
        })
        .then(value => {
            let responsePromises = [];
            for (let i in value) {
                responsePromises.push(resolvePromises(value[i]));
            }
            return q.all(responsePromises);
        })
        .then(value => {
            let responses = {};
            for (let i in sectionNames) {
                responses[i] = value[i].responses.map(response => response.fields)
            }
            return responses;
        })
        .then(value => {
            sectionResponse = value
            return loadSkeletonJson(`${config.app_pages}/${reqConfig}HomePage`)
        })
        .then(value => {
            responseStructure = value.data;
            for (let i in sectionResponse) {
                responseStructure.result.response.sections[i].contents.push(...sectionResponse[i]);
            }

            return generateResponseStructure(responseStructure);
        })
        .then(value => {
            responseStructure = value.responseStructure;
            responseStructure.ts = new Date();
            responseStructure.ver = parsedReq.ver;
            responseStructure.id = parsedReq.id;
            responseStructure.name = parsedReq.request.name;
            responseStructure.params.resmsgid = uuidv4();
            responseStructure.params.msgid = uuidv4();

            return res.status(200).json(responseStructure);
        })
        .catch(e => {
            console.log(e);
            return res.status(500).json({
                err: e
            });
        });
}

let performSearch = (req, res) => {
    /*
        request body structure :
        {
           "request": {
            "facets": [
              "contentType",
              "domain",
              "ageGroup",
              "language",
              "gradeLevel"
            ],
            "filters": {
              "status": [
                "Live"
              ],
              "compatibilityLevel": {
                "min": 1,
                "max": 3
              },
              "objectType": [
                "Content"
              ],
              "contentType": [
                "Story",
                "Worksheet",
                "Game",
                "Collection",
                "TextBook"
              ]
            },
            "sort_by": {},
            "mode": "soft",
            "query": "",
            "limit": 100
          }
        }


    */
    let request = req.body.request;
    let facets = request.facets;
    let responseStructure = {};
    let secondaryQuery = request.filters.identifier || request.filters.contentType;
    let limit;
    let offset;
    let query = request.query || secondaryQuery.join(' ');
    if (query.length < 1) {
        query = request.filters.identifier[0];
    }

    loadSkeletonJson('searchResponseSkeleton')
        .then(value => {
            responseStructure = value.data;
            if("offset" in request) {
                limit = request.limit;
                offset = request.offset;
            } else {
                limit = 1000;
                offset = 0;
            }    
            return doThoroughSearch(query, limit, offset);
        })
        .then(value => {
            let mappedValues = value.responses.map(val => val.fields);
            return performCounting(mappedValues, facets);
        })
        .then(value => {
            responseStructure.result.count = value.results.length;
            responseStructure.result.content = value.results;
            responseStructure.result.facets = value.facets;
            return res.status(200).json(responseStructure);
        })
        .catch(e => {
            console.log(e);
            return res.status(500).json({
                e
            });
        });
}

let getEcarById = (req, res) => {
    let contentID = req.params.contentID;
    let responseStructure = {};
    let limit = 1000;
    let offset = 0;
    loadSkeletonJson('searchIdResponseSkeleton')
        .then(value => {
            responseStructure = value.data;
            return doThoroughSearch(contentID, limit, offset);
        })
        .then(value => {
            responseStructure.result.content = value.responses[0].fields;
            return res.status(200).json(responseStructure);
        })
        .catch(e => {
            return res.status(500).json({
                e
            });
        });
}

let telemetryData = (req, res) => {
    let body = JSON.stringify(req.body);
    let telemetryDir = config.telemetry.src_dir;
    let now = new Date().getTime();
    baseInt++;
    let responseStructure = {};
    let newFileName = baseInt + '_' + 'tm_' + now + '.json';
    createFolderIfNotExists(telemetryDir)
        .then(value => {
            let newFile = fs.createWriteStream(telemetryDir + newFileName);
            newFile.end();
            return loadSkeletonJson('telemetryResponseSkeleton');
        })
        .then(value => {
            responseStructure = value.data;
            fs.writeFile(telemetryDir + newFileName, body, (err) => {
                responseStructure.ts = new Date();
                return res.status(200).json(responseStructure);
            })
        })
        .catch(e => {
            responseStructure.status = "error";
            responseStructure.errmsg = e;
            return res.status(500).json(responseStructure);
        });
}

/*
    Moves a file with a promise wrapper; deletes any older file present with the same name.
*/
let moveFileWithPromise = (source, destination) => {
    let defer = q.defer();
    fs.rename(source, destination, (err) => {
        if (err && err.code === 'ENOTEMPTY') {
            deleteDir(destination)
                .then(value => {
                    fs.rename(source, destination, (err) => {
                        if (err) {
                            return defer.reject(err);
                        } else {
                            return defer.resolve(destination);
                        }
                    });
                });
        } else if (err) {
            return defer.reject(err);
        } else {
            return defer.resolve(destination);
        }
    });
    return defer.promise;
}

/*
    Creates a folder if it does not exist. Essentially an internal handler
*/
let createFolderIfNotExists = (folderName) => {
    let defer = q.defer();
    fs.stat(folderName, (err, stats) => {
        if (err || !(stats.isDirectory())) {
            fs.mkdir(folderName, (err) => {
                if (err) {
                    console.log(err);
                    return defer.reject({
                        err: 'Cannot create folder'
                    });
                } else {
                    return defer.resolve();
                }
            })
        } else {
            return defer.resolve();
        }
    });
    return defer.promise;
}

let performRecommendation = (req, res) => {
    let body = req.body;
    let query = req.query;
    let params = req.params;
    console.log(body);
    console.log(query);
    console.log(params);
    return res.status(200).json({
        ok: 'ok'
    });
}

let modifyJsonData = (jsonFile, file) => {
    let defer = q.defer();
    fs.readFile(jsonFile, (err, data) => {
        if (err) {
            return defer.reject({
                err
            });
        } else {
            try {
                jsonData = JSON.parse(data);
                let downloadUrl = jsonData.archive.items[0].downloadUrl;
                console.log(downloadUrl);
                if (downloadUrl) {
                    let website = downloadUrl.match(/^http(s?):\/\/(((\w|\d)+)\.)+(\w|\d)+/);
                    if (website && downloadUrl.indexOf("youtube") !== -1) {
                        downloadUrl = downloadUrl.slice(0, downloadUrl.indexOf(website) + website.length) + '/ecar_files/' + file;
                    } else {
                        downloadUrl = config.content_url + file;
                    }
                    jsonData.archive.items[0].downloadUrl = downloadUrl;
                } else {
                    downloadUrl = config.content_url + file;
                    jsonData.archive.items[0].downloadUrl = downloadUrl;
                }
                return defer.resolve({
                    jsonData
                });
            } catch (err) {
                return defer.reject({
                    err
                });
            }
        }
    });
    return defer.promise;
}

let writeNewData = (jsonData, jsonFile) => {
    let defer = q.defer();
    fs.writeFile(jsonFile, JSON.stringify(jsonData), (err) => {
        if (err) {
            return defer.reject({
                err
            });
        } else {
            return defer.resolve(jsonFile);
        }
    });
    return defer.promise;
}

let changeDownloadUrl = (jsonFile, file) => {
    let defer = q.defer();
    modifyJsonData(jsonFile, file)
        .then(value => {
            return writeNewData(value.jsonData, jsonFile)
        })
        .then(value => {
            return defer.resolve({
                jsonFile
            });
        })
        .catch(err => {
            return defer.reject({
                err
            });
        });
    return defer.promise;
}

let deleteXContentFolderIfExists = (dir, file) => {
    let defer = q.defer();
    let folderNameStart = file.lastIndexOf("do_");
    let folderNameEnd = file.lastIndexOf("_");
    let folderName = file.slice(folderNameStart, folderNameEnd) + '/';
    fs.stat(dir + 'xcontent/' + folderName, (err, stats) => {
        if (err) {
            return defer.resolve();
        } else {
            deleteDir(dir + folderName)
                .then(value => {
                    return defer.resolve();
                })
                .catch(err => {
                    return defer.reject({
                        err
                    });
                });
        }
    });
    return defer.promise;
}

let deleteMovedJsonFileIfExists = (dir, file) => {
    let defer = q.defer();
    fs.stat(dir + 'json_dir/' + file + '.json', (err, stats) => {
        if (err) {
            return defer.resolve();
        } else {
            fs.unlink(dir + 'json_dir/' + file + '.json', (err) => {
                if (err) {
                    return defer.reject({
                        err
                    });
                } else {
                    return defer.resolve();
                }
            })
        }
    });
    return defer.promise;
}

let deleteMovedEcarFileIfExists = (dir, file) => {
    let defer = q.defer();
    fs.stat(dir + 'ecar_files/' + file, (err, stats) => {
        if (err) {
            return defer.resolve();
        } else {
            fs.unlink(dir + 'ecar_files/' + file, (err) => {
                if (err) {
                    return defer.reject({ err });
                } else {
                    return defer.resolve();
                }
            })
        }
    });
    return defer.promise;
}

let deleteOriginalEcarFileIfExists = (dir, file) => {
    let defer = q.defer();
    fs.stat(dir + file, (err, stats) => {
        if (err) {
            return defer.resolve();
        } else {
            fs.unlink(dir + file, (err) => {
                if (err) {
                    return defer.reject({
                        err
                    });
                } else {
                    return defer.resolve();
                }
            })
        }
    });
    return defer.promise;
}

let deleteEcarData = (dir, file) => {
    let defer = q.defer();
    let fileNameAsFolder = file.slice(0, file.lastIndexOf('.')) + '/';
    deleteOriginalEcarFileIfExists(dir, file)
        .then(value => {
            console.log("Deleted original ecar file: " + file);
            return deleteDir(dir + fileNameAsFolder);
        })
        .then(value => {
            console.log("Deleted temporary folder: " + file);
            return deleteXContentFolderIfExists(dir, file);
        })
        .then(value => {
            console.log("Deleted XContent: " + file);
            return deleteMovedEcarFileIfExists(dir, file);
        })
        .then(value => {
            console.log("Deleted ECAR File: " + file);
            return deleteMovedJsonFileIfExists(dir, file);
        })
        .then(value => {
            console.log("Deleted JSON File: " + file);
            return defer.resolve();
        })
        .catch(err => {
            console.log("Delete ecar error!: " + file);
            console.log(err);
            return defer.reject({
                err
            });
        });
    return defer.promise;
}

/*
    Post extraction methods, called if extraction is successful and data needs to be post-processed.
*/
let moveInternalFolders = (dir, fileNameAsFolder) => {
    let defer = q.defer();
    const parent = dir + fileNameAsFolder;

    readdir(parent)
        .then(files => {
            const filesDetailsPromises = files.map(file => {
                const path = parent + file;
                return getInfo(path).then(stats => ({
                    ...stats,
                    path,
                    name: file,
                    isDirectory: stats.isDirectory()
                }));
            });

            return q.all(filesDetailsPromises);
        })
        .then(filesDetails => {
            const internalFolders = filesDetails.filter(item => item.isDirectory);
            const moveFilePromises = internalFolders.map(folder => moveFileWithPromise(folder.path, `${dir}xcontent/${folder.name}`));
            return q.all(moveFilePromises);
        })
        .then(moveFileStatus => {
            defer.resolve();
        })
        .catch(e => {
            defer.reject(e);
        });

    return defer.promise;
}

let readFileWithPromise = (path) => {
    let defer = q.defer();

    fs.readFile(path, (err, data) => {
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve(JSON.parse(data));
        }
    });

    return defer.promise;
}

let getEcarName = (id, ver) => `${id}_0.0.ecar`;

let doPostExtraction = (dir, file) => {
    let defer = q.defer();
    let fileNameAsFolder = file.slice(0, -5) + '/';

    /*
      1. Transfer the ecar file to ecar_files Directory
      2. Rename manifest.json to name of ecar file and sent to json_files
      3. Transfer the do_whatever folder to xcontent
    */
    let manifestData = undefined;
    const manifestFile = dir + fileNameAsFolder + 'manifest.json';

    readFileWithPromise(manifestFile)
        .then(fileData => {
            manifestData = fileData;

            return createFolderIfNotExists(dir + 'ecar_files/');
        })
        .then(resolve => {
            const id = manifestData.archive.items[0].identifier;
            const ver = manifestData.archive.items[0].pkgVersion;
            const target = getEcarName(id, ver);

            return moveFileWithPromise(dir + file, dir + 'ecar_files/' + target);
        })
        .then(resolve => {
            console.log("Moved file to ecar_files: " + file);
            return createFolderIfNotExists(dir + 'json_dir/');
        })
        .then(resolve => {
            const id = manifestData.archive.items[0].identifier;
            const ver = manifestData.archive.items[0].pkgVersion;
            const target = getEcarName(id, ver);

            let jsonFile = dir + fileNameAsFolder + 'manifest.json';

            console.log("Attempting to play with " + jsonFile);

            return changeDownloadUrl(jsonFile, target);
        })
        .then(resolve => {
            let jsonFile = resolve.jsonFile;

            const id = manifestData.archive.items[0].identifier;
            const ver = manifestData.archive.items[0].pkgVersion;
            const target = getEcarName(id, ver);

            return moveFileWithPromise(jsonFile, dir + 'json_dir/' + target + '.json');
        })
        .then(resolve => {
            console.log("Moved JSON file: " + file);
            return createFolderIfNotExists(dir + 'xcontent/');
        })
        .then(resolve => {
            return moveInternalFolders(dir, fileNameAsFolder);
        })
        .then(value => {
            console.log("Moved XContent: " + file);
            return deleteDir(dir + fileNameAsFolder);
        })
        .then(value => {
            console.log("Deleted directory: " + file);
            return defer.resolve(value);
        })
        .catch(e => {
            console.log("Wrong ecar format for " + file);
            console.log(e);
            return defer.reject({
                err: e
            });
            deleteEcarData(dir, file)
                .then(value => {
                    return defer.reject({
                        err: e
                    });
                })
                .catch(err => {
                    return defer.reject({
                        err
                    })
                });
        });
    return defer.promise;
}

let performExtraction = (parentDir, fileName, folderName) => {
    let defer = q.defer();

    console.log("Attempting to extract");
    console.log(parentDir + fileName);
    console.log(parentDir + folderName);

    extractZip(parentDir + fileName, parentDir + folderName)
        .then(value => {
            console.log("Completed extraction");
            return defer.resolve(value);
        }, reason => {
            return defer.reject({
                err: 'Cannot extract this file'
            });
        })
        .catch(e => {
            console.log("Error occured in extractZip");
        });
    return defer.promise;
}

/*
    Does pre-extraction, extraction, and post extraction
*/
let extractFile = (dir, file) => {
    let defer = q.defer();
    let folderName = '';

    console.log("Extracting " + file);

    createFolderToExtractFiles(dir, file)
        .then(value => {
            console.log("Created folder for extraction: " + file);
            folderName = value;
            return performExtraction(dir, file, folderName);
        })
        .then(value => {
            console.log("Extracted!: " + file);
            return doPostExtraction(dir, file);
        })
        .then(value => {
            console.log("Post extraction done!: " + file);
            return defer.resolve(value);
        })
        .catch(e => {
            console.log("Error processing " + file);
            if (e.err && e.err === 'Cannot extract this file') {
                deleteEcarData(dir, file)
                    .then(value => {
                        return defer.reject(e);
                    })
                    .catch(e2 => {
                        return defer.reject(e2);
                    });
            } else {
                return defer.reject(e);
            }
        });
    return defer.promise;
}

let createFolderToExtractFiles = (dir, file) => {
    let defer = q.defer();
    let newFolderName = file.slice(0, file.lastIndexOf("."));
    fs.stat(dir + newFolderName, (err, stats) => {
        if (err) {
            fs.mkdir(dir + newFolderName, (err, stats) => {
                if (err) {
                    return defer.reject({
                        err: 'Cannot create folder'
                    });
                } else {
                    return defer.resolve(newFolderName);
                }
            });
        } else {
            return defer.resolve(newFolderName);
        }
    });
    return defer.promise;
}

let log = (controller, body, path) => {
    console.log('Path called :', path);
    console.log('Controller :', controller);
    console.log('Req body :\n', body);
}

module.exports = {
    getHomePage,
    performSearch,
    getEcarById,
    telemetryData,
    extractFile,
    performRecommendation,
    createFolderIfNotExists
}