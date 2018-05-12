let express = require('express');
let router = express.Router();

let MongoClient = require('mongodb').MongoClient;
let url = "mongodb://localhost:27017";
const {ObjectId} = require('mongodb');


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

        let dbo = db.db("web");
        let where = {UserID: req.query.id};
        dbo.collection("userAccount").find(where).toArray(function(err, result) {
            if (err) throw err;
            if (result === ""){
                console.log("No such user");
                res.render('user/profile', { title: 'profile' , status: 0, id: req.query.id});
            }else{
                console.log("Found!");
                let pri = result[0].PrivacyBits;
                let Adr = "";
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
    req.session.userID = '5af52b61b238639f70ee4311';

    /*if (req.session.sign){
        console.log("ok");
    }else {
        console.log("no");
        req.session.sign = 1;
    }*/
    MongoClient.connect(url, function(err, db){
        if (err) throw err;
        console.log("Success connect");

        let dbo = db.db("web");
        let where = {UserID: req.session.userID};
        dbo.collection("userAddress").find(where).toArray(function(err, result) {
            if (err) throw err;
            if (result === ""){
                console.log("No such user adderss");
                res.render('user/address', { title: 'address' , status: 0, num: result.length});
            }else{
                console.log("Found!");
                res.render('user/address', { title: 'address' , status: 1, data: result, num: result.length});
            }
        });
        db.close();
    });

});

router.post('/submitAddress', function(req, res) {
    req.session.userID = '5af52b61b238639f70ee4311';

    if (req.body.adrNum === '0'){
        req.body.UserID = req.session.userID;
        req.body.AddressID = parseInt(req.body.totNum) + 1;
        delete req.body.totNum;
        delete req.body.adrNum;
        console.log(req.body);
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            console.log("Success connect");

            let dbo = db.db("web");

            dbo.collection("userAddress").insertOne(req.body,function(err, result) {
                if (err) throw err;
                console.log("Inserted!");
                res.send({msg: "ok"});
            })
            db.close();
        });
    }else{
        //update
    }
});
router.post('/deleteAddress', function(req, res){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("web");

        let myquery = {
            UserID: req.session.userID,
            _id: ObjectId(req.body.ID)
        };
        console.log(myquery);
        dbo.collection("userAddress").deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            console.log("Delete success!");
            db.close();
            res.send({msg: "ok"});
        });
    });
});

router.get('/setting', function(req, res, next) {
    MongoClient.connect(url, function(err, db){
        if (err) throw err;
        console.log("Success connect");

        let dbo = db.db("web");
        let where = {UserID: req.query.id};
        dbo.collection("userAccount").find(where).toArray(function(err, result) {
            if (err) throw err;
            console.log("Found!");
            let pri = result[0].PrivacyBits;
            delete result[0].password;
            if (pri[3] === '0') {
                console.log("no Address ");
                res.render('user/setting', { title: 'setting' , status: 1, id: result[0]._id.toString() , data: result[0], adr: Adr});
            }
        });
        console.log("Finish");
        db.close();
    });
});

router.get('/addbook', function(req, res, next) {
    res.render('user/addbook', { title: 'addbook' });
});
router.post('/submitBook', function(req, res) {
    req.body.sellerID = req.session.userID;
    req.body.date = (new Date()).toISOString().split('T')[0];
    req.body.bookStatus = "Available";

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("web");

        console.log(req.body);
        dbo.collection("book").insertOne(req.body,function(err, result) {
            if (err) throw err;
            console.log("Inserted!");
            res.send({msg: "ok"});
        })
        db.close();
    });
});

router.post('/deleteBook', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("web");

        let myquery = {
            sellerID: req.session.userID,
            _id: ObjectId(req.body.ID)
        };
        console.log(myquery);
        dbo.collection("book").deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            console.log("Delete success!");
            db.close();
            res.send({msg: "ok"});
        });
    });
});
router.get('/mybook', function(req, res, next) {
    MongoClient.connect(url, function(err, db){
        if (err) throw err;
        console.log("Success connect");

        let dbo = db.db("web");
        let where = {sellerID: req.session.userID};
        if (req.query.status){
            where.bookStatus = req.query.status;
        }
        console.log(where);
        dbo.collection("book").find(where).toArray(function(err, result) {
            if (err) throw err;
            console.log("Found!");
            res.render('user/mybook', { title: 'mybook', data: result, num: result.length});
        });
        db.close();
    });
});
let ISBresult;
function ISBNtoTitle(data, index, res){
    if (index === data.length){
        console.log(data);

        res.render('user/favorite', { title: 'favorite', data: data, num: data.length});
        return;
    }
    MongoClient.connect(url, function(err, db){
        if (err) throw err;
        let dbo = db.db("web");
        let where = {ISBN: data[index].ISBN};

        dbo.collection("book").find(where).toArray(function(err, result) {
            if (err) throw err;
            data[index].bookTitle = result[0].bookTitle;
            ISBNtoTitle(data, (parseInt(index) + 1), res);
        });
        db.close();
    });
}


router.post('/deleteFavorite', function(req, res) {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("web");

        let myquery = {
            userID: req.session.userID,
            _id: ObjectId(req.body.ID)
        };
        console.log(myquery);
        dbo.collection("favorite").deleteOne(myquery, function(err, obj) {
            if (err) throw err;
            console.log("Delete success!");
            db.close();
            res.send({msg: "ok"});
        });
    });
});
router.get('/favorite', function(req, res, next) {
    MongoClient.connect(url, function(err, db){
        if (err) throw err;
        console.log("Success connect");

        let dbo = db.db("web");
        let where = {userID: req.session.userID};

        console.log(where);
        dbo.collection("favorite").find(where).toArray(function(err, result) {
            if (err) throw err;
            ISBNtoTitle(result, 0, res);
        });
        db.close();
    });
});

module.exports = router;
