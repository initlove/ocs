/**
 * Module dependencies.
 */
var ocs = require('./ocs');
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

app.get('/:version/config', ocs.config.get);
app.post('/:version/person/check', ocs.person.check);
app.post('/:version/person/add', ocs.person.add);
app.post('/:version/person/remove', ocs.person.remove);
app.get('/:version/person/data', function(req, res) {
    account.authenticate(req, res, person.search);
});
app.get('/:version/person/data/:personid', function(req, res) {
    account.authenticate(req, res, person.get);
});
app.get('/:version/person/self', function(req, res) {
    account.authenticate(req, res, person.getself);
});
app.post('/:version/person/self', function(req, res) {
    account.authenticate(req, res, person.edit);
});
app.get('/:version/person/balance', function(req, res) {
    account.authenticate(req, res, person.get_balance);
});

app.get('/:version/friend/status/:personid', function(req, res) {
    account.authenticate(req, res, friend.status);
});
app.get('/:version/friend/data/:personid', function(req, res) {
    account.authenticate(req, res, friend.get);
});
app.get('/:version/friend/receivedinvitations', function(req, res) {
    account.authenticate(req, res, friend.rece);
});
app.get('/:version/friend/sentinvitations', function(req, res) {
    account.authenticate(req, res, friend.sent);
});
app.post('/:version/friend/invite/:personid', function(req, res) {
    account.authenticate(req, res, friend.invite);
});
app.post('/:version/friend/approve/:personid', function(req, res) {
    account.authenticate(req, res, friend.approve);
});
app.post('/:version/friend/decline/:personid', function(req, res) {
    account.authenticate(req, res, friend.decline);
});
app.post('/:version/friend/cancel/:personid', function(req, res) {
    account.authenticate(req, res, friend.cancel);
});

app.get('/:version/message', function(req, res) {
    account.authenticate(req, res, message.list);
});
app.post('/:version/message', function(req, res) {
    account.authenticate(req, res, message.send);
});

app.get('/:version/fan/data/:contentid', function(req, res) {
    account.authenticate(req, res, content.getfan);
});
app.get('/:version/fan/status/:contentid', function(req, res) {
    account.authenticate(req, res, content.isfan);
});
app.post('/:version/fan/add/:contentid', function(req, res) {
    account.authenticate(req, res, content.addfan);
});
app.post('/:version/fan/remove/:contentid', function(req, res) {
    account.authenticate(req, res, content.removefan);
});

app.post('/:version/content/add', content.add);
app.get('/:version/content/data', content.list);
app.get('/:version/content/categories', content.categories);
app.get('/:version/content/data/:contentid', content.get);
app.get('/:version/content/download/:contentid/:itemid', content.download);
app.get('/:version/content/download/:contentid', content.download_default);
app.post('/:version/content/vote/:contentid', function(req, res) {
    account.authenticate(req, res, content.vote);
});

app.get('/:version/comments/data/:type/:contentid/:contentid2', content.getcomment);
app.post('/:version/comments/add', function(req, res) {
    account.authenticate(req, res, content.addcomment);
});
app.post('/:version/comments/vote/:commentid', function(req, res) {
    account.authenticate(req, res, comment.vote);
});

//the following were not tested yet 

app.post ('/images/upload', image.upload);
app.get('/images/:imageid', image.get);

/* the following is restful, try to make the service out of the ocs standard */
/* TODO: change to 
 *  fan.localhost/:urlmd5
 *  fan.localhost/:urlmd5/fans
 *  fan.localhost/:personid/follow
 */
app.get('/:urlmd5/fanstatus', function(req, res) {
    account.authenticate(req, res, fan.status);
});
app.post('/:urlmd5/fanstatus', function(req, res) {
    account.authenticate(req, res, fan.add);
});
app.delete('/:urlmd5/fanstatus', function(req, res) {
    account.authenticate(req, res, fan.remove);
});
app.get('/:urlmd5/fans', function(req, res) {
    account.authenticate(req, res, fan.get);
});
//app.get('/:personid/follow', fan.follow);
app.post('/:urlmd5/vote', function(req, res) {
    account.authenticate(req, res, vote.vote);
});

/*
app.post('/:urlmd5/comment', function(req, res) {
    account.authenticate(req, res, comment.add);
});
*/
app.post('/:urlmd5/comment', comment.add);
app.get('/:urlmd5/comment', comment.get);

