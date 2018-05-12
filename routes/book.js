let express = require('express');
let router = express.Router();

let MongoClient= require("mongodb").MongoClient;
let url = "mongodb://localhost:27017";
const {ObjectId} = require('mongodb');

/* GET home page. */
router.get('/detail', function(req, res, next) {
    /*if (!req.session.userID) {
        res.render("jump", {title: 'jump'});
    } else let userID = req.session.userID; */
    var userID = req.session.userID;

    let data = req.query;
    let isbn = data.isbn;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        let dbo = db.db("web");
        var name;
        name = req.query.addTag;

        if (req.query.addTag) {
            dbo.collection("tags").find({tagName: name}).toArray(function (err, res) {
                if (res.length > 0) return ;
                dbo.collection("tags").insertOne({tagName: name, userID: userID, ISBN: isbn});
            })
        }

        if (req.query.delTag) {
            name = req.query.delTag;
            dbo.collection("tags").deleteMany({tagName: name});
        }

        if (req.query.addFav) {
            dbo.collection("favorite").find({userID: userID, ISBN: isbn}).toArray(function (err, res) {
                console.log("HERE");
                if (res.length > 0) return ;
                dbo.collection("favorite").insertOne({userID: userID, ISBN: isbn, date: (new Date()).toISOString().split('T')[0]});
                console.log("SBCMR");
            })
        }

        if (req.query.delFav) {
            dbo.collection("favorite").deleteMany({userID: userID, ISBN: isbn});
        }

        let where = {ISBN: isbn, bookStatus: "Available"};
        if (data.recordID)
            where._id = data.recordID;
        console.log("FAV");
        dbo.collection("favorite").find({userID: userID, ISBN: isbn}).toArray(function (err, favList) {
            let favFlag = 0;
            if (favList.length > 0) favFlag = 1;
            if (req.query.addFav) favFlag = 1;
            if (req.query.delFav) favFlag = 0;
            console.log({_id: ObjectId(userID)});
            dbo.collection("userAccount").find({_id: ObjectId(userID)}).toArray(function (err, userList) {
                let username = userList[0].Username;
                dbo.collection("tags").find({ISBN: isbn}).toArray(function (err, tagList) {
                    for (i = 0; i < tagList.length; i++)
                        if (tagList[i].userID == userID)
                            tagList[i].delUrl = "http://172.104.175.75:3000/book/detail?isbn=" + isbn + "&delTag=" + tagList[i].tagName;
                    dbo.collection("book").find(where).toArray(function(err, bookList) {
                        res.render('book/bookDetail', {
                            isbn: isbn,
                            title: 'book details',
                            data : data,
                            list: bookList,
                            favorite: favFlag, flag : req.session.flag,
                            tagList: tagList});
                    });
                });
            });
        });
    });
});

router.get('/test', function (req, res, next) {
    res.render('book/test', {flag : req.session.flag});
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

router.get("/", function (req, res, next) {
    MongoClient.connect(url, function(err, db) {
        let dbo=db.db("web");
        dbo.collection("book").find().sort({date: -1}).limit(10).toArray(function (err, rank) {
            res.render('book/index', {list: rank, flag : req.session.flag});
        });
    });
});

router.get("/search", function (req, res, next) {
    let isbn = req.query.ISBN;
    let title = req.query.title;
    let tags = req.query.tags;
    let where = {};
    if (isbn) where.ISBN = isbn;
    if (title) where.bookTitle = new RegExp(title);
    MongoClient.connect(url, function(err, db) {
        let dbo=db.db("web");
        dbo.collection("book").find(where).toArray(function (err, list1) {
            if (tags) where={tagName:tags};
            dbo.collection("tags").find(where).toArray(function (err, list2) {
                // console.log("ss");
                // console.log(where);
                let rank = [];
                if (tags) {
                    for (i = 0; i < list2.length; i++)
                        for (j = 0; j < list1.length; j++)
                            if (list1[j].ISBN == list2[i].ISBN)
                                rank.push(list1[j].ISBN);
                } else
                    for (i = 0; i < list1.length; i++)
                        rank.push(list1[i].ISBN);
                // console.log(rank);
                rank = Array.from(new Set(rank));
                // console.log(rank);
                res.render("book/search", {list: rank, query: req.query, flag : req.session.flag});
            })
            //res.render("book/search", {list: {}});
        });
    });
})

router.get("/record", function (req, res, next) {
    if (!req.session.flag) {
        res.render("reminLogin", {title: 'jump', flag : req.session.flag});
    } else {
        var userID = req.session.userID;
    }

    let data = req.query;
    let isbn = data.isbn;
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;

        let dbo = db.db("web");
        dbo.collection("userAccount").find({_id: ObjectId(userID)}).toArray(function (err, userList) {
            let username = userList[0].Username;
            dbo.collection("tags").find({ISBN: isbn}).toArray(function (err, tagList) {
                dbo.collection("book").find({ISBN: isbn, sellerID: userID}).toArray(function (err, bookList) {
                    if (bookList.length === 0)
                        res.render("../jump.pug", {flag : req.session.flag});
                    res.render('book/record', {
                        isbn: isbn,
                        title: 'record details',
                        username: username,
                        list: bookList[0],
                        tagList: tagList, flag : req.session.flag
                    });
                });
            });
        });
    });
});

module.exports = router;
