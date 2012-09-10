var utils = require('../utils');
var account = require('./account');
var express = require('express');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var attributeSchema = new Schema({
    app: String
    ,key: String
    ,value: String
    ,lastmodifed: {type: Date, default: Date.now}
});

var personSchema = new Schema({
//    _id: {type: ObjectId, select: false}
//    NOTE: when I set _id select == false, it seems cannot update it ..
    personid: {type: String, required: true, unique: true}
    //TODO: password save here? or just in the account
    ,password: {type: String, required: true}
    ,privacy: {type: Number, default:0}     /*TODO: enum ? */
    ,privacytext: {type: String}       
    ,firstname: {type: String, required: true}
    ,lastname: {type: String, required: true}
    ,email: {type: String, required: true}
    ,gender: String
    ,birthday: Date
    ,company: String
    ,homepage: String
    ,country: String
    ,city: String
    ,longitude: Number
    ,latitude: Number
    ,currency: {type: String, default: "RMB"}
    ,balance: {type: Number, default: 0}
    ,role: {type: String, default: "user"}
    ,attributes: {type: [attributeSchema], default:[]}
});

mongoose.connect(utils.dbname);
var personModel = mongoose.model('person', personSchema);
var attrModel = mongoose.model('attr', attributeSchema);

exports.check = function(req, res) {
    /*TODO:  fail 5 times in 5 minutes, the account or the IP hang for 1 hour? 
     *   or send a validation email to enable it immediately
    */
    if (!req.body.login || !req.body.password) {
        return utils.message(req, res, 101, "please specify all mandatory fields");
    }
    personModel.findOne({'personid': req.body.login, 'password': req.body.password}, function(err, doc) {
        if (err) {
            return utils.message(req, res, 911, "Server error: "+err);
        } else if (doc) {
            var meta = {"status": "ok", "statuscode": 100};
            var data = new Array();
            data [0] = {"person": {"personid": req.body.login}};
            var result = {"ocs": {"meta": meta, "data": data}};
            return utils.info(req, res, result);
        } else {
            return utils.message(req, res, 102, "login not valid");
        }
    });
};

/*TODO: details is full */
exports.getself = function(req, res) {
    var personid = utils.get_username(req);
    personModel.findOne({'personid': personid}, function(err, doc) {
        if (err) {
            console.log(err);
            return utils.message(req, res, 911, "Server error "+err);
        } else if (doc) {
            var meta = {"status":"ok", "statuscode":100};
            var data = new Array();
            data[0] = {"person": doc};
            var result = {"ocs": {"meta": meta, "data": data}};
            return utils.info(req, res, result);
        } else {
            return utils.message(req, res, 911, "Server error: cannot find the person.");
        }
    });
};

exports.edit = function(req, res) {
    if (!req.body.latitude && 
        !req.body.longtitude &&
        !req.body.city &&
        !req.body.country) {
            utils.message(req, res, "no parameters to update found");
            return;
        }

    var login = utils.get_username(req);
    var info = {};
    if (req.body.latitude) {
        info.latitude = req.body.latitude;
    }
    if (req.body.longtitude) {
        info.longtitude = req.body.longtitude;
    }
    if (req.body.city) {
        info.city = req.body.city;
    }
    if (req.body.country) {
        info.country = req.body.country;
    }

    personModel.update({"personid":login}, info, function(err) {
        if (err) {
            utils.message(req, res, 911, "Server error "+err);
        } else {
            utils.message(req, res, 100, "ok");
        }
    });
};

exports.add_user = function(user, callback) {
    //TODO: when mongod did not start, the server is hung without any info?
    personModel.findOne({"personid":user.personid}, function(err, doc) {
        if (err) {
            callback(false, 911, "Server error "+err);
            console.log(err);
        } else if (doc) {
            callback(false, 104, "login already exists");
        } else {
            personModel.findOne({"email":user.email}, function(err, doc) {
                if (err) {
                    callback(false, 911, "Server error "+err);
                    console.log(err);
                } else if (doc) {
                    callback(false, 105, "email already taken");
                } else {
                    var person = new personModel();
                    for (var key in user) {
                        person[key] = user[key];
                    }
                    person.save(function(err) {
                        if (err) {
                            callback(false, 911, "Server error "+err);
                            console.log(err);
                        } else {
                            callback(true, 100, "ok");
                        }
                    });
                }
            });
        }
    });
};

/*TODO: add and edit should take care of all the props */
exports.add = function(req, res) {
    var user = {};
    user.personid = req.body.login;
    user.password = req.body.password;
    user.firstname = req.body.firstname;
    user.lastname = req.body.lastname;
    user.email = req.body.email;

    if (!user.personid||
        !user.password ||
        !user.firstname ||
        !user.lastname ||
        !user.email) {
        utils.message(req, res, 101, "please specify all mandatory fields ");
        return;
    }

    var password_filter = /[a-zA-Z0-9]{8,}/;
    if (!password_filter.test(user.password)) {
        utils.message(req, res, 102, "please specify a valid password");
        return;
    }

    /*TODO: we did not spec the standard here */
    var login_filter = /[a-zA-Z0-9]{4,}/;
    if (!login_filter.test(user.personid)) {
        utils.message(req, res, 103, "please specify a valid login");
        return;
    }

    var email_filter = /[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}/;
    if (!email_filter.test(user.email)) {
        utils.message(req, res, 106, "email invalid");
        return;
    }
    account.add(user.personid, user.password, function(r, code, msg) {
        if (r){
            exports.add_user(user, function(r, code, msg) {
                utils.message(req, res, code, msg);
            });
        } else {
            utils.message(req, res, code, msg);
        }
    });
};

exports.remove = function(req, res) {
    var login = req.body.login;
    var password = req.body.password;

    if (!login || !password) {
        utils.message(req, res, 101, "please specify all mandatory fields ");
        return;
    }
    personModel.remove({"personid" : login}, function(err) {
        if (err) {
            utils.message(req, res, 911, "Server error "+err);
            console.log(err);
        } else {
            utils.message(req, res, 100, "ok");
        }
    });
};

exports.get = function(req, res) {
    var login = utils.get_username(req);
    personModel.findOne({"personid": req.params.personid}, function(err, doc) {
        if (err) {
            utils.message(req, res, 911, "Server error "+err);
            console.log(err);
        } else if (doc) {
            var meta = {"status":"ok", "statuscode":100};
            var data = new Array();
            /*question for the spec? that is the privacy level?*/
            if (doc.privacy) {
                utils.message(req, res, 102, "data is private");
            } else {
                data [0] = {"person": doc};
                var result = {"ocs": {"meta": meta, "data": data}};
                utils.info(req, res, result);
            }
        } else {
            utils.message(req, res, 101, "person not found");
        }
    });
};

exports.search = function(req, res) {
    var page = 0;
    var pagesize = 10;

    if (req.query.page)
        page = parseInt(req.query.page);
    if (req.query.pagesize)
        pagesize = parseInt(req.query.pagesize);

    /*TODO: search other fields */
    var query = {};
    if (req.query.name) {
        query.$or = new Array();
        query.$or[0] = {"personid" : new RegExp(req.query.name, 'i')};
        query.$or[1] = {"firstname" : new RegExp(req.query.name, 'i')};
        query.$or[2] = {"lastname" : new RegExp(req.query.name, 'i')};
    }
/*TODO: attrs */
    personModel.count(query, function(err, count) {
        if (err) {
            utils.message(req, res, 911, "Server error "+err);
            console.log(err);
        } else {
            if (count > page*pagesize) {
                personModel.find(query).skip(page*pagesize).limit(pagesize).exec(function(err, docs) {
                    if (err) {
                        utils.message(req, res, 911, "Server error "+err);
                        console.log(err);
                    } else if (docs.length > 1000) {
                        utils.message(req, res, 102, "more than 1000 people found. it is not allowed to fetch such a big resultset. please specify more search conditions ");
                    } else {
                        var meta = {"status":"ok", "statuscode":100,
                                    "totalitems": count, "itemsperpage": pagesize};
                        var data = new Array();
                        for(var i = 0; docs[i]; i++) {
                            data [i] = {"person": docs[i]};
                        }
                        var result = {"ocs": {"meta": meta, "data": data}};
                        utils.info(req, res, result);
                    }
                });
            } else {
                var meta = {"status":"ok", "statuscode":100,
                            "totalitems": count, "itemsperpage": pagesize};
                var result = {"ocs": {"meta": meta}};
                utils.info(req, res, result);
            }
        }
    });
};

/*TODO details balance */
exports.get_balance = function(req, res) {
    var login = utils.get_username(req);
    personModel.findOne({"personid":login}, function(err, doc) {
        if (err) {
            utils.message(req, res, 911, "Server error "+err);
        } else if (doc) {
            var data = new Array();
            /*TODO: default currency*/
            data[0] = {"person": {"currency": doc.currency, 
                                "balance": doc.balance}};
            var meta = {"status": "ok", "statuscode": 100};
            var result = {"ocs": {"meta": meta, "data": data}};
            utils.info(req, res, result);
        } else {
            utils.message(req, res, 101, "person not found: in get balance, should never happen");
        }
    });
};

exports.get_attr = function(req, res) {
    var personid = req.params.personid;
    personModel.findOne({"personid":personid}, function(err, doc) {
        if (err) {
            utils.message(req, res, 911, "Server error "+err);
        } else if (doc) {
            var data = new Array();
            var _filter = false;
            if (req.params.app || req.params.key)
                _filter = true;
            for (var i = 0; i < doc.attributes.length; i++) {
                if (_filter == false
                    || (req.params.app && (doc.attributes[i].app == req.params.app))
                    || (req.params.key && (doc.attributes[i].key == req.params.key))
                   )
                    data.push(doc.attributes[i]);
            }
            var meta = {"status": "ok", "statuscode": 100};
            var result = {"ocs": {"meta": meta, "data": data}};
            utils.info(req, res, result);
        } else {
            utils.message(req, res, 101, "person not found");
        }
    });
};

exports.set_attr = function(req, res) {
    var personid = utils.get_username(req);
    //TODO: how to find with array data? --mongoose
    personModel.findOne({"personid":personid}, function(err, doc) {
        if (err) {
            utils.message(req, res, 911, "Server error "+err);
        } else if (doc) {
            var _update = false;
            for (var i = 0; i < doc.attributes.length; i++) {
                if (req.params.app == doc.attributes[i].app) {
                    if (req.params.key == doc.attributes[i].key) {
                        /*if app and key was same, update it*/
                        doc.attributes[i].value = req.body.value;
                        _update = true;
                        break;
                    }
                }
            }
            if (!_update) {
                var attr = new attrModel();
                attr.app = req.params.app;
                attr.key = req.params.key;
                attr.value = req.body.value;
                doc.attributes.push(attr);
            }
            doc.save(function(err) {
                if (err) {
                    utils.message(req, res, 911, "Server error "+err);
                } else {
                    utils.message(req, res, 100, "ok");
                }
            });
        } else {
            utils.message(req, res, 101, "person not found: in set attr, should never happen");
        }
    });
};

exports.delete_attr = function(req, res) {
    var personid = utils.get_username(req);
    personModel.findOne({"personid":personid}, function(err, doc) {
        if (err) {
            utils.message(req, res, 911, "Server error "+err);
        } else if (doc) {
            var _update = false;
            for (var i = 0; i < doc.attributes.length; i++) {
                if (req.params.app == doc.attributes[i].app) {
                    if (req.params.key == doc.attributes[i].key) {
                        doc.attributes.splice(i, 1);
                        _update = true;
                        break;
                    }
                }
            }
            if (_update) {
                doc.save(function(err) {
                    if (err) {
                        utils.message(req, res, 911, "Server error "+err);
                    } else {
                        utils.message(req, res, 100, "ok");
                    }
                });
            } else {
                /* my added error code */
                utils.message(req, res, 101, "cannot find the matched attr");
            }
        } else {
            utils.message(req, res, 101, "person not found: in set attr, should never happen");
        }
    });
};
