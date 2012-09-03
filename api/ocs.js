function proper(version, service) {
    return require('./'+version+'/'+service);
};

var osc = module.exports ={
    config: module.exports = {
        get: function(req, res) {
            proper(req.params.version, 'config').get(req, res);
        },
    },
};
