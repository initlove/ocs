var jsontoxml = require('jsontoxml');

//exports.dbname = "mongodb://admin:XP9jx78hpWkq@127.4.84.129:27017/api";
//exports.dbname = 'mongodb://testuser:testpassword@localhost/test';
exports.dbname = 'mongodb://localhost/test';

/*TODO: should we have statuscode ? */
exports.meta = function(message_type) {
    var meta = {};
    switch(message_type) {
        case "ok":
            meta.status = "ok";
            meta.statuscode = 100;
            break;
        case "successfull / valid account":
            meta.status = "ok";
            meta.statuscode = 100;
            break;
        case "Server error":
            meta.statuscode = 110;
            break;
        case "no permission to get fan status":
            meta.statuscode = 101;
            break;
        case "You need to login":
            meta.statuscode = 101;
            break;
        case "user not found":
            meta.statuscode = 102;
            break;
        case "You can not send a message to yourself":
            meta.statuscode = 103;
            break;
        case "subject or message not found":
            meta.statuscode = 104;
            break;
        case "You should name who the receiver is":
            meta.statuscode = 105;
            break;
        case "You have already been the fan":
            meta.statuscode = 102;
            break;
        case "You are not the fan":
            meta.statuscode = 102;
            break;
        case "wrong type":
            meta.statuscode = 104;
            break;
        case "not authenticated":
            meta.statuscode = 102;
            break;
        case "person not found":
            meta.statuscode = 101;
            break;
        case "login not valid":
            meta.statuscode = 102;
            break;
        case "please specify all mandatory fields":
            meta.statuscode = 101;
            break;
        case "please specify a valid password":
            meta.statuscode = 102;
            break;
        case "please specify a valid login":
            meta.statuscode = 103;
            break;
        case "login aleady exists":
            meta.statuscode = 104;
            break;
        case "email already taken":
            meta.statuscode = 105;
            break;
        case "please specify a valid email":
            meta.statuscode = 106;
            break;
        case "message or subject must not be empty":
            meta.statuscode = 102;
            break;
        case "no permission to add a comment":
            meta.statuscode = 103;
            break;
        case "no permission to get person info":
            meta.statuscode = 103;
            break;
        case "comment not found":
            meta.statuscode = 104;
        case "content must not be empty":
            meta.statuscode = 101;
            break;
        case "content not found":
            meta.statuscode = 101;
            break;
        case "invalid comment id":
            meta.statuscode = 105;
            break;
        case "invalid content id":
            meta.statuscode = 105;
            break;
        case "content item not found":
            meta.statuscode = 103;
            break;
        case "vote with score between 0 and 100":
            meta.statuscode = 102;
            break;
        case "no permission to vote":
            meta.statuscode = 104;
            break;
        case "you have already voted on this content":
            meta.statuscode = 105;
            break;
        case "need to post the file...":
            meta.statuscode = 101;
            break;
        case "please fill with 'image'":
            meta.statuscode = 102;
            break;
        case "invalid image id":
            meta.statuscode = 103;
            break;
        case "Cannot find the image":
            meta.statuscode = 104;
            break;
        default :
            console.log("Some meta result was not include: " + message_type + "\n");
            meta.statuscode = 111;
            break;
    }
    if(message_type != "ok") {
        meta.status = "fail";
        meta.message = message_type;
    }
    return meta;
}

exports.get_username = function(req) {
    var header = req.headers.authorization || '';
    var token = header.split(/\s+/).pop() || '';
    var auth = new Buffer(token, 'base64').toString();
    var parts = auth.split(":");
     
    return parts[0];  
}

exports.get_password = function(req) {
    var header = req.headers.authorization || '';
    var token = header.split(/\s+/).pop() || '';
    var auth = new Buffer(token, 'base64').toString();
    var parts = auth.split(":");
     
    return parts[1];  
}

exports.info = function(req, res, result) {
    /*TODO: default to json one day */
    if(req.query.format &&(req.query.format == 'json')) {
        /*make the head plain for web view */
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(JSON.stringify(result));
    } else {
        var str = JSON.stringify (result);
        var r = JSON.parse (str);
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(jsontoxml.obj_to_xml(r, true));
    }
}

/* old one 
exports.message = function(req, res, msg) {
    var result = {"ocs": {"meta": exports.meta(msg)}};
    if(req.query.format && (req.query.format == 'json')) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(JSON.stringify(result));
    } else {
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(jsontoxml.obj_to_xml(result, true));
    }
}
*/

exports.message = function(req, res, code, msg) {
    var result = {"ocs": {"meta": {"status": msg, "statuscode":code, "message":null}}};
    if(req.query.format && (req.query.format == 'json')) {
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end(JSON.stringify(result));
    } else {
        res.writeHead(200, {'Content-Type': 'text/xml'});
        res.end(jsontoxml.obj_to_xml(result, true));
    }
}
