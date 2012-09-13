var person = require('./person');
var utils = require('../utils');
var express = require('express');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

//In the send box, unread means not answered
/* message status:
 * unread   - 0
 * read     - 1
 * answered - 2
 */
var messageDetailsSchema = new Schema({
    messagefrom: {type: String, required: true}
    ,messageto: {type: String, required: true}
    //Who is firstname lastname refer to? from or to ?
    ,subject: {type: String, required: true}
    ,body: {type: String, required: true}
    ,senddate: {type: Date, default: Date.now}
    ,status: {type: Number, default: 0}
});

var folderSchema = new Schema({
    id: {type: Number}
    ,name: {type: String}
    ,count: {type: Number, default: 0}
    ,type: {type: String}
    ,messages: {type: [messageDetailSchema], default:[]}
});

var messageSchema = new Schema({
//    _id: {type:ObjectId, select:false}
//    as we need to implement trash. we need to join one's messages together
    personid: {type: String, required: true}
    ,folders: {type: [folderSchema], default:[]}
});

mongoose.connect(utils.dbname);
var messageModel = mongoose.model('message', messageSchema);
var folderModel = mongoose.model('folder', messageSchema);
var messageDetailsModel = mongoose.model('messageDetails', messageDetailsSchema);

var INBOX = 0;
var SENDBOX = 1;
var TRASH = 2;
var ARCHIVE = 3;

var default_folders = ["inbox", "send", "trash", "archive"];

exports.folder_init = function(personid, callback) {
    var msg = new messageModel();
    msg.personid = personid;
    for (var i = 0; i < 4; i++) {
        var folder = new folderModel();
        folder.id = i;
        folder.name = default_folders[i];
        folder.type = default_folders[i];
        msg.folders.push(folder);
    }
    msg.save(function(err) {
        if (err) {
            callback(false, 911, "Server err " + err);
        } else {
            callback(true, 100, "ok", msg);
        }
    });
};

exports.folder = function(req, res){
    var login = utils.get_username(req);
    messageModel.findOne({"personid": login}, function(err,doc) {
        if (err) {
            utils.message(req, res, 911, "Server err " + err);
        } else if (!doc) {
            /* create the user's folder info */
            exports.folder_init(login, function(r, code, msg) {
                if (r) {
                    var data = new Array[];
                    var meta = {"status": "ok", "statuscode": 100, "message": null, "totalitems": 4};
                    for (var i = 0; i < 4; i++) {
                        var folder = {"id": i, "name": default_folders[i], "messagecount":0, "type": default_folders[i]};
                        data.push(folder);
                    }
                    var result = {"ocs": {"meta": meta, "data": data}};
                    utils.info(req, res, result);
                } else {
                    utils.message(req, res, code, msg);
                }
            });
        } else {
           for (var i = 0; i < doc.folders.length; i++) {
               var data = new Array[];
               var meta = {"status": "ok", "statuscode": 100, "message": null, "totalitems": 4};
               for (var i = 0; i < 4; i++) {
                   var folder = {"id": doc.folders[i].id, 
                       "name": doc.folders[i].name,
                       "messagecount": doc.folders[i].messagecount,
                       "type": doc.folders[i].type}
                   data.push(folder);
               }
               var result = {"ocs": {"meta": meta, "data": data}};
               utils.info(req, res, result);
           }
        }
    });
}

exports.get = function(req, res){
    var login = utils.get_username(req);
    messageModel.findOne({"personid": login}, function(err,doc) {
        if (err) {
            utils.message(req, res, 911, "Server err "+err);
        } else if (!doc) {
            utils.message(req, res, 101, "message not found");
        } else {
            if (folderid < 0 || folderid > 3) {
                utils.message(req, res, 107, "invalid folder id"); //my added
            } else {
                //TODO: not done, as the message id not done 
                for (var i = 0; i < doc.folders[folderid].length; i++) {
                    if (req.params.messageid == doc.folders[folderid][i].id)
                        return break;
                }
                return ...
            }
        }
    });
}

exports.save_message = function(message, personid, folderid, callback){
    messageModel.findOne({"personid": personid}, function(err,doc) {
        if (err) {
            callback(false, 911, "Server err "+err);
        } else if (!doc) {
            exports.folder_init(personid, function(r, code, msg, doc) {
                if (r) {
                    if (folderid < 0 || folderid > 3) {
                        callback(false, 911, "wrong folder: should never happen in server");
                    } else {
                        doc.folders[folderid].push(message);
                        doc.save(function(err) {
                            if (err) {
                                callback(false, 911, "Server err "+err);
                            } else {
                                callback(true, 100, "ok");
                            }
                        });
                    }
               } else {
                    callback(false, code, msg);
               }
            });
        } else {
            doc.folders[folderid].push(message);
            doc.save(function(err) {
                if (err) {
                    callback(false, 911, "Server err "+err);
                } else {
                    callback(true, 100, "ok");
                }
            });
        }
    });
}

exports.send = function(req, res){
    if(!req.body.message || !req.body.subject) {
        utils.message(req, res, 102, "subject or message not found");
        return;
    }
    var to = req.body.to;
    if(!to) {
        utils.message(req, res, 104, "You should name who the receiver is");
        return;
    }
    var login = utils.get_username(req);
    var password = utils.get_password(req);
    if(login == to) {
        utils.message(req, res, 103, "You can not send a message to yourself");
        return;
    }

    person.valid(to, function(r, code, msg) {
        if (r) {
            var message = new messageModel();
            message.messagefrom = login;
            message.messageto = to;
            message.subject = req.body.subject;
            message.body = req.body.message;
            exports.save_message(message, login, SENDBOX, function(r, code, msg) {
                if (r) {
                    exports.save_message(message, to, INBOX, function(r, code, msg) {
                        utils.message(req, res, code, msg);
                    });
                } else {
                    //TODO: rollback ?
                    utils.message(req, res, code, msg);
                }
            });
        } else {
            utils.message(req, res, code, msg);
        }
    });
}

exports.list = function(req, res){
    var login = utils.get_username(req);
    var password = utils.get_password(req);
    var page = 0;
    var pagesize = 10;
    if(req.query.page)
        page = parseInt(req.query.page);
    if(req.query.pagesize)
        pagesize = parseInt(req.query.pagesize);

    var query = null;
    if(req.query.search)
        query = req.query.search;
    var status = -1;
    if(req.query.status)
        status = parseInt(req.query.status);

    messageModel.findOne({"personid": login}, function(err,doc) {
        if(err) {
            utils.message(req, res, 911, "Server error "+err);
        } else if (!doc){
            exports.folder_init (personid, function(r, code, msg) {
                if (r) {
                    var meta = {"status":"ok", "statuscode": 100, "message": null,
                                "totalitems": 0, "itemsperpage": pagesize };
                    var result = {"ocs": {"meta": meta, "data": null}};
                    utils.info(req, res, result);
                } else {
                    //we can reply without telling the server err
                    //but it is better to do it to find the server bug.
                    utils.message(req, res, code, msg);
                }
            });
        } else {
            //BIG issue, may said in other place, how to do the search in array ? 
            var number = 0;
            var data = new Array();
            for (var i = 0; i < doc.folders[req.params.folderid].length; i++) {
                var _message = doc.folders[req.params.folderid][i];
                if (status >= 0) {
                    if (_message.status != status)
                        continue;
                }
                if (query) {
                    //TODO: not done, should search with Reg
                    if (_message.subject (query) || _message.body(query)) {
                        number ++;
                        if (number >= page * pagesize) && (number < (page+1) * pagesize)
                           data.push({"message": _message});
                    }
                }
            }
            var meta = {"status":"ok", "statuscode": 100, "message": null,
                        "totalitems": data.length, "itemsperpage": pagesize};
            var result = {"ocs": {"meta": meta, "data": data}};
            utils.info(req, res, result);
        }
    });
}
