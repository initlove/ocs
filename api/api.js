/**
 * Module dependencies.
 */
var express = require('express');
var form = require('connect-form');

var app = express.createServer();
exports.app = app;

// Configuration
app.configure(function(){
   app.use(express.bodyParser()); 
// I remove it as I don't know what happens inside, the upload complete function will not emit..
//    app.use(express.methodOverride());
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

function R(req, res, service, fn, callback){
    var S = require('./'+req.params.version+'/'+service);
    if (S && S[fn]){
        S[fn](req, res, callback);
    } else {
/* TODO: cannot find the service? exception? */
    }
};

/* need login */
function AR(req, res, service, fn){
    var S = require('./'+req.params.version+'/'+service);
    if (S && S[fn]){
        R(req, res, 'account', 'authenticate', S[fn]);
    } else {
/* TODO: cannot find the service? exception? */
    }
};

/***  config  ***/
app.get('/:version/config', function(req, res){
    R(req, res, 'config', 'get');
});

/***  person  ***/
app.post('/:version/person/check', function(req, res){
    R(req, res, 'person', 'check');
});
app.post('/:version/person/add', function(req, res){
    R(req, res, 'person', 'add');
});
app.post('/:version/person/remove', function(req, res){
    R(req, res, 'person', 'remove');    /*my api*/
});
app.get('/:version/person/data', function(req, res){
    AR(req, res, 'person', 'search');
});
app.get('/:version/person/data/:personid', function(req, res){
    AR(req, res, 'person', 'get');
});
app.get('/:version/person/self', function(req, res){
    AR(req, res, 'person', 'getself');
});
app.post('/:version/person/self', function(req, res){
    AR(req, res, 'person', 'edit');
});
app.get('/:version/person/balance', function(req, res){
    AR(req, res, 'person', 'get_balance');
});
app.get('/:version/person/attributes/:personid', function(req, res){
    R(req, res, 'person', 'get_attr');
});
app.get('/:version/person/attributes/:personid/:app', function(req, res){
    R(req, res, 'person', 'get_attr');
});
app.get('/:version/person/attributes/:personid/:app/:key', function(req, res){
    R(req, res, 'person', 'get_attr');
});
app.post('/:version/person/setattribute/:app/:key', function(req, res){
    AR(req, res, 'person', 'set_attr');
});
app.post('/:version/person/deleteattribute/:app/:key', function(req, res){
    AR(req, res, 'person', 'delete_attr');
});

/*** friend ***/
app.get('/:version/friend/data/:personid', function(req, res){
    AR(req, res, 'friend', 'get');
});
app.get('/:version/friend/status/:personid', function(req, res){
    AR(req, res, 'friend', 'status'); /* mine */
});
app.get('/:version/friend/receivedinvitations', function(req, res){
    AR(req, res, 'friend', 'rece');
});
app.get('/:version/friend/sentinvitations', function(req, res){
    AR(req, res, 'friend', 'sent');
});
app.post('/:version/friend/invite/:personid', function(req, res){
    AR(req, res, 'friend', 'invite');
});
app.post('/:version/friend/approve/:personid', function(req, res){
    AR(req, res, 'friend', 'approve');
});
app.post('/:version/friend/decline/:personid', function(req, res){
    AR(req, res, 'friend', 'decline');
});
app.post('/:version/friend/cancel/:personid', function(req, res){
    AR(req, res, 'friend', 'cancel');
});

/*** message ***/
/*** spec TODO: how to trash or archive ? ***/
app.get('/:version/message', function(req, res){
    AR(req, res, 'message', 'folder');
});
app.get('/:version/message/:folderid', function(req, res){
    AR(req, res, 'message', 'list');
});
app.get('/:version/message/:folderid/:messageid', function(req, res){
    AR(req, res, 'message', 'get');
});
/* a little strange to name the folderid */
app.post('/:version/message/:folderid', function(req, res){
    AR(req, res, 'message', 'send');
});

app.get('/:version/fan/data/:contentid', function(req, res){
    AR(req, res, 'content', 'getfan');
});
app.get('/:version/fan/status/:contentid', function(req, res){
    AR(req, res, 'content', 'isfan');
});
app.post('/:version/fan/add/:contentid', function(req, res){
    AR(req, res, 'content', 'addfan');
});
app.post('/:version/fan/remove/:contentid', function(req, res){
    AR(req, res, 'content', 'removefan');
});

app.post('/:version/content/add', function(req, res){
    R(req, res, 'content', 'add');
});
app.get('/:version/content/data', function(req, res){
    R(req, res, 'content', 'list');
});
app.get('/:version/content/categories', function(req, res){
    R(req, res, 'content', 'categories');
});
app.get('/:version/content/data/:contentid', function(req, res){
    R(req, res, 'content', 'get');
});
app.get('/:version/content/download/:contentid/:itemid', function(req, res){
    R(req, res, 'content', 'download');
});
app.get('/:version/content/download/:contentid', function(req, res){
    R(req, res, 'content', 'download_default'); /*my api*/
});
app.post('/:version/content/vote/:contentid', function(req, res){
    AR(req, res, 'content', 'vote');
});

app.get('/:version/comments/data/:type/:contentid/:contentid2', function(req, res){
    R(req, res, 'content', 'getcomment');
});
app.post('/:version/comments/add', function(req, res){
    AR(req, res, 'content', 'addcomment');
});
app.post('/:version/comments/vote/:commentid', function(req, res){
    AR(req, res, 'comment', 'vote');
});
