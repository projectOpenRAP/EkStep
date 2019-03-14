let {
    initializeEkStepData
} = require('./ekstep.init.js')

let ekstepData = {};

let addEkStepData = (req, res, next) => {
    req.ekstepData = ekstepData;
    next();
}

initalizeMiddleWare = () => {
    initializeEkStepData('/opt/opencdn/appServer/plugins/ekstep/profile.json').then(value => {
        ekstepData = value;
    });
}

initalizeMiddleWare();

module.exports = {
    addEkStepData
}
