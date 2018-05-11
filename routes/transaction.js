/*
交易系统
    交易详情页 todo
    买家 todo
        正在进行的交易【包括是否接受等等】 todo
        已完成的交易 todo
    卖家 todo
        正在进行的交易【也可以拒绝】 todo
        已完成的交易 todo
查询交易 todo
*/

let express = require('express');
let transactionDB = require('../db/transaction');
let router = express.Router();

let MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017";

/* GET home page. */



router.get('/list/buy', function(req, res, next) {
  transactionDB.find({buyerID: /*req.session.userID*/"5af56448b79f528af2f126b4"}).exec(function (err, docs) {
    let transactionList = [];
    docs.forEach(function (item) {
      transactionList.push({
        transactionID: item._id,
        recordID: item.recordID,
        anotherUserID: item.sellerID,
        transactionStatus: item.transactionStatus
      })
    });
    // console.log(transactionList);
    res.render('transaction/list', {transactionList: transactionList});
  });
});

router.get('/list/sell', function(req, res, next) {
  transactionDB.find({sellerID: /*req.session.userID*/"5af56448b79f528af2f126b4"}, function (err, docs) {
    let transactionList = [];
    docs.forEach(function (item) {
      transactionList.push({
        transactionID: item.recordID,
        anotherUserID: item.buyerID,
        transactionStatus: item.transactionStatus
      })
    });
    // console.log(transactionList);
    res.render('transaction/list', {transactionList: transactionList});
  });
});

router.get('/new/:recordID', function (req, res, next) {

});

router.post('/new', function (req, res, next) {

});

router.get('/detail/:transactionID', function (req, res, next) {
  transactionDB.findOne({
    _id: req.params.transactionID/*,
    $or: [
      { sellerID: req.session.userID },
      { buyerID: req.session.userID }
    ]*/}).exec(function (err, transaction) {
    if (!transaction) {
      err = new Error();
      err.status = 404;
      res.render("error", {message: "Transaction Not Found", error: err});
      return;
    }
    let isBuyer = transaction.buyerID.toString() === "5af5d79cabaade2100a9cfea";
    console.log("isBuyer:", isBuyer);
    let transactionInfo = {};
    // console.log(transaction);
    // todo 拉取书籍信息
    // todo 拉取另一方用户信息
    // todo 拉取地址信息
    MongoClient.connect(url, function (err, mongo) {
      if (err) throw err;
      let db = mongo.db("web");
      db.collection("book").findOne({_id: transaction.recordID}, function (err, book) {
        db.collection("userAccount").findOne({_id: isBuyer ? transaction.sellerID : transaction.buyerID}, function (err, user) {
          db.collection("userAddress").findOne({_id: transaction.addressID}, function (err, address) {
            // console.log(book);
            // console.log(user);
            // console.log(address);
            transactionInfo.buyer = {};
            if (isBuyer) {
              transactionInfo.seller = {};
              transactionInfo.seller.fullName = user.FirstName + " " + user.LastName;
              transactionInfo.seller.phone = user.Phone;
              transactionInfo.seller.email = user.Email;
            } else {
              transactionInfo.buyer.fullName = user.FirstName + " " + user.LastName;
              transactionInfo.buyer.phone = user.Phone;
              transactionInfo.buyer.email = user.Email;
            }
            transactionInfo.book = {};
            transactionInfo.book.title = book.bookTitle;
            transactionInfo.book.price = book.price;
            transactionInfo.book.paymentMethod = book.payment;
            transactionInfo.book.condition = book.bookCondition;
            transactionInfo.buyer.address = "";
            let data = [];
            data.push(address.StreetNum);
            data.push(address.StreetAddress);
            data.push(address.City);
            data.push(address.State);
            data.push(address.Country);
            for (let i = 0; i <= 4; i++) {
              if (transactionInfo.buyer.address !== "") transactionInfo.buyer.address += ", ";
              transactionInfo.buyer.address += data[i];
            }
            transactionInfo.buyer.address += ' (Zip code: ' + address.ZipCode + ')';
            transactionInfo.status = transaction.transactionStatus;
            console.log(transactionInfo);
            res.render("transaction/detail", transactionInfo);
          });
        });
      });
    });
    // res.render("transaction/detail", {detail: transaction});
  })
});

module.exports = router;
