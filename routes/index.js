let express = require('express');
let router = express.Router();
var MongoDB = require('mongodb').Db;
var Server = require('mongodb').Server;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/index', function(req, res, next) {
    var where = {};
    book.find(where).toArray(function(err, result) {
        if (err) throw err;
        console.log(result)
        res.render('index', { title: 'Express', books: result});
    });
});

router.get('/login', function(req, res, next) {
    res.render('login', { title: 'Express' });
});

var dbName = 'web';
var dbHost = 'localhost';
var dbPort = 27017;
var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
db.open(function(e, d){
    if (e) {
        console.log(e);
    } else {
            console.log('mongo :: connected to database :: "'+dbName+'"');
    }
});
var accounts=db.collection('userAccount')
var book=db.collection('book')

manualLogin = function(req, user, pass, callback)
{
    accounts.findOne({Username:user}, function(e, o) {
        if (o === null){
            callback('user-not-found');
        }	else{
            validatePassword(pass, o.Password, function(err, res) {
                if (res){
                    req.session.userID=o._id;
                    req.session.sign=1;
                    callback(null, o);
                }	else{
                    callback('invalid-password');
                }
            });
        }
    });
}

var validatePassword = function(plainPass, hashedPass, callback)// todo 检查加密密码
{
    return callback(null, hashedPass === plainPass);
}

router.post('/login', function(req, res){
    manualLogin(req, req.body.user, req.body.pass, function(e, o){
        if (!o){
            res.status(400).send(e);
        }	else{
            req.session.user = o;
            if (req.body['remember-me'] == 'true'){
                res.cookie('user', o.user, { maxAge: 900000 });
                res.cookie('pass', o.pass, { maxAge: 900000 });
            }
            res.status(200).send(o);
        }
    });
});

router.get('/signup', function(req, res, next) {
    res.render('signup', { title: 'Express' });
});

addNewAccount = function(newData, callback)// todo 密码加密
{
    console.log(newData)
    accounts.findOne({Username:newData.Username}, function(e, o) {
        if (o){
            callback('username-taken');
        }	else{
            accounts.findOne({Email:newData.Email}, function(e, o) {
                if (o){
                    callback('email-taken');
                }	else{
                    accounts.findOne({Phone:newData.Phone}, function(e, o) {
                        if (o){
                            callback('phone-taken');
                        }	else {
                            // append date stamp when record was created //
                            accounts.insert(newData, {safe: true}, callback);
                        }
                    });
                }
            });
        }
    });
}

router.post('/signup', function(req, res){
    console.log(req.body)
    addNewAccount({
        FirstName 	: req.body['fname'],
        LastName 	: req.body['lname'],
        Email 	: req.body['email'],
        Username 	: req.body['user'],
        Password	: req.body['pass'],
        Gender	: req.body['gender'],
        Birth	: req.body['birth'],
        Phone   : req.body['phone'],
        PrivacyBits:'0000'
    }, function(e){
        if (e){
            res.status(400).send(e);
        }	else{
            res.status(200).send('ok');
        }
    });
});

module.exports = router;
