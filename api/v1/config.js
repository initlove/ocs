//var utils = require ('./utils');

var config = module.exports = {
    get: function(req, res) {
        var meta = {};
        meta.status = "ok";
        meta.statuscode = 100;
        var data = {};
        data.version = '1.7';
        data.website = 'localhost:3000';
        data.host = 'api.localhost:3000';
        data.contact = 'liangchenye@gmail.com';
        var result = {"ocs": {"meta": meta, "data": data}};
console.log(result);
  //      utils.info(req, res, result);
    },
};
