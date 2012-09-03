/* req:
 * res:
 * service: service name
 * fn: operation under the service
 * callback: for account authenticate only.
 */
function R(req, res, service, fn, callback) {
    var S = require('./'+req.params.version+'/'+service);
    if (S && S[fn]) {
        S[fn](req, res, callback);
    } else {
//TODO: cannot find the service? exception?
    }
};
            
function AR(req, res, service, fn) {
    var S = require('./'+req.params.version+'/'+service);
    if (S && S[fn]) {
        ocs.account.authenticate(req, res, S[fn]);
    } else {
    }
};

var ocs = module.exports ={
    account: module.exports = {
        authenticate: function(req, res, callback) {
            R(req, res, 'account', 'authenticate', callback);
        },
    },
    config: module.exports = {
        get: function(req, res) {
            R(req, res, 'config', 'get');
        },
    },
    person: module.exports = {
        check: function(req, res) {
            R(req, res, 'person', 'check');
        },
        add: function(req, res) {
            R(req, res, 'person', 'add');
        },
        remove: function(req, res) {
            R(req, res, 'person', 'remove');
        },
        search: function(req, res) {
            AR(req, res, 'person', 'search');
        },
        get: function(req, res) {
            AR(req, res, 'person', 'get');
        },
        getself: function(req, res) {
            AR(req, res, 'person', 'getself');
        },
        edit: function(req, res) {
            AR(req, res, 'person', 'edit');
        },
        get_balance: function(req, res) {
            AR(req, res, 'person', 'get_balance');
        },
    },
};
