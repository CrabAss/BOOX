let express = require('express');
let router = express.Router();

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";


const bodyParser = require("body-parser");

router.use(bodyParser.urlencoded({
    extended: false
}));

router.use(bodyParser.json());

/* GET home page. */
router.get('/profile', function(req, res, next) {
    MongoClient.connect(url, function(err, db){
        if (err) throw err;
        console.log("Success connect");

        var dbo = db.db("web");
        var where = {UserID: req.query.id};
        dbo.collection("userAccount").find(where).toArray(function(err, result) {
            if (err) throw err;
            if (result == ""){
                console.log("No such user");
                res.render('user/profile', { title: 'profile' , status: 0, id: req.query.id});
            }else{
                console.log("Found!");
                var pri = result[0].PrivacyBits;
                var Adr = "";
                if (pri[0] === '0') {delete result[0].FirstName; delete result[0].LastName;}
                if (pri[1] === '0') delete result[0].Gender;
                if (pri[2] === '0') delete result[0].Birth;
                if (pri[3] === '0') {
                    console.log("no Address ");
                    res.render('user/profile', { title: 'profile' , status: 1, id: result[0]._id.toString() , data: result[0], adr: Adr});
                }else{

                }
            }
        });
        console.log("Finish");
        db.close();
    });
});

router.get('/address', function(req, res, next) {
    if (req.session.sign){
        console.log("ok");
    }else {
        console.log("no");
        req.session.sign = 1;
    }
    res.render('user/address', { title: 'address' });
});

router.get('/setting', function(req, res, next) {
    res.render('user/setting', { title: 'setting' });
});

module.exports = router;
