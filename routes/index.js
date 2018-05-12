let express = require('express');
let router = express.Router();
let MongoDB = require('mongodb').Db;
let Server = require('mongodb').Server;
let bcrypt = require('bcrypt');

let MongoClient= require("mongodb").MongoClient;
let url = "mongodb://localhost:27017";
const {ObjectId} = require('mongodb');

/* GET home page. */
router.get('/', function(req, res, next) {
    if (!req.session.flag){
      req.session.flag = 0;
    }
    MongoClient.connect(url, function(err, db) {
        let dbo=db.db("web");
        dbo.collection("book").find().sort({date: -1}).limit(10).toArray(function (err, rank) {
            res.render('book/index', {title: "Index", list: rank, flag : req.session.flag});
        });
    });
});

router.get('/index', function(req, res, next) {
    MongoClient.connect(url, function(err, db) {
        let dbo=db.db("web");
        dbo.collection("book").find().sort({date: -1}).limit(10).toArray(function (err, rank) {
            res.render('book/index', {title: "Index", list: rank, flag : req.session.flag});
        });
    });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' , flag : req.session.flag});
});
router.get('/logout', function(req, res, next) {
    req.session.flag = 0;
    res.render('logout', { title: 'Logout' , flag : req.session.flag});
});


let dbName = 'web';
let dbHost = 'localhost';
let dbPort = 27017;
let db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
db.open(function(e, d){
  if (e) {
    // console.log(e);
  } else {
    // console.log('mongo :: connected to database :: "'+dbName+'"');
  }
});
let accounts=db.collection('userAccount');
let book=db.collection('book');

manualLogin = function(req, user, pass, callback) {
  accounts.findOne({Username:user}, function(e, o) {
    if (o === null){
      callback('user-not-found');
    }	else{
      validatePassword(pass, o.Password, function(err, res) {
        if (res){
          req.session.userID = o._id;
          req.session.sign = 1;
          callback(null, o);
        }	else{
          callback('invalid-password');
        }
      });
    }
  });
};

let validatePassword = function(plainPass, hashedPass, callback)
{
  return callback(null, bcrypt.compareSync(plainPass, hashedPass));
};

router.post('/login', function(req, res){
  manualLogin(req, req.body.user, req.body.pass, function(e, o){
    if (!o){
      res.status(400).send(e);
    }	else{
      req.session.user = o;
      req.session.userID = o._id;
      req.session.flag = 1;
      if (req.body['remember-me'] === 'true'){
        res.cookie('user', o.user, { maxAge: 900000 });
        res.cookie('pass', o.pass, { maxAge: 900000 });
      }
      res.status(200).send(o);
    }
  });
});

router.get('/signup', function(req, res, next) {

  res.render('signup', {flag : req.session.flag});
});

addNewAccount = function(newData, callback) {
  // console.log(newData);
  accounts.findOne({Username:newData.Username}, function(e, o) {
    if (o) callback('username-taken');
    else {
      accounts.findOne({Email:newData.Email}, function(e, o) {
        if (o) callback('email-taken');
        else {
          accounts.findOne({Phone:newData.Phone}, function(e, o) {
            if (o) callback('phone-taken');
            else {
              // append date stamp when record was created

              accounts.insert(newData, {safe: true}, callback);
            }
          });
        }
      });
    }
  });
};

router.post('/signup', function(req, res){
  // console.log(req.body);
  bcrypt.hash(req.body['pass'], 10, function(err, hash) {
    // Store hash in your password DB.
    addNewAccount({
      FirstName: req.body['fname'],
      LastName: req.body['lname'],
      Email: req.body['email'],
      Username: req.body['user'],
      Password: hash,
      Gender: req.body['gender'],
      Birth: req.body['birth'],
      Phone: req.body['phone'],
      PrivacyBits: '0000'
    }, function(e){
      if (e) {
        res.status(400).send(e);
      }	else {
        res.status(200).send('ok');
      }
    });
  });
});

module.exports = router;
