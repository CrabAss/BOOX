let express = require('express');
let router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017";


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
                    console.log("no Address");
                    res.render('user/profile', { title: 'profile' , status: 1, id: req.query.id, data: result[0], adr: Adr});
                }else{

                }
                console.log(pri[0]);

            }
        });
        console.log("Finish");
        db.close();
    });
});

module.exports = router;
