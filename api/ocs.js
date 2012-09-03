//TODO: cannot find the service? exception?
function R(req, service) {
    return require('./'+req.params.version+'/'+service);
};

var ocs = module.exports ={
    config: module.exports = {
        get: function(req, res) {
            R(req, 'config').get(req, res);
        },
    },
    person: module.exports = {
        check: function(req, res) {
            R(req, 'person').check(req, res);
        },
        add: function(req, res) {
            R(req, 'person').add(req, res);
        },
        remove: function(req, res) {
            R(req, 'person').remove(req, res);
        },
    },
};
