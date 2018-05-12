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
const {ObjectId} = require('mongodb');

/* GET home page. */



router.get('/list/buy', function(req, res, next) {
  MongoClient.connect(url, function (err, mongo) {
    if (err) throw err;
    let db = mongo.db("web");
    db.collection("transactions").aggregate([
      {$match: {buyerID: /*req.session.userID*/ObjectId("5af5d79cabaade2100a9cfea")}},
      {$lookup: {
        from: "book",
        localField: "recordID",
        foreignField: "_id",
        as: "bookRecord"
      }},
      {$lookup: {
        from: "userAccount",
        localField: "sellerID",
        foreignField: "_id",
        as: "sellerInfo"
      }}], function (err, docs) {
        let transactionList = [];
        docs.forEach(function (item) {
          // console.log(item.bookRecord);
          transactionList.push({
            transactionID: item._id,
            recordID: item.bookRecord[0].bookTitle,
            anotherUserID: item.sellerInfo[0].FirstName + " " + item.sellerInfo[0].LastName,
            transactionStatus: item.transactionStatus,
            readStatus: item.buyerIsRead
          })
        });
        // console.log(transactionList);
        res.render('transaction/list', {transactionList: transactionList});
    });
  });
});

router.get('/list/sell', function(req, res, next) {
  MongoClient.connect(url, function (err, mongo) {
    if (err) throw err;
    let db = mongo.db("web");
    db.collection("transactions").aggregate([
      {$match: {sellerID: /*req.session.userID*/ObjectId("5af5d79cabaade2100a9cfea")}},
      {$lookup: {
          from: "book",
          localField: "recordID",
          foreignField: "_id",
          as: "bookRecord"
        }},
      {$lookup: {
          from: "userAccount",
          localField: "buyerID",
          foreignField: "_id",
          as: "buyerInfo"
        }}], function (err, docs) {
      let transactionList = [];
      docs.forEach(function (item) {
        // console.log(item.bookRecord);
        transactionList.push({
          transactionID: item._id,
          recordID: item.bookRecord[0].bookTitle,
          anotherUserID: item.buyerInfo[0].FirstName + " " + item.buyerInfo[0].LastName,
          transactionStatus: item.transactionStatus,
          readStatus: item.sellerIsRead
        })
      });
      // console.log(transactionList);
      res.render('transaction/list', {transactionList: transactionList});
    });
  });

});

router.get('/new/:recordID', function (req, res, next) {
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
        console.log("No such user address");
        res.render('user/address', { title: 'address' , status: 0, num: result.length});
      }else{
        console.log("Found!");
        res.render('user/address', { title: 'address' , status: 1, data: result, num: result.length});
      }
    });
    db.close();
  });

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
    transaction.readStatus = true;
    let isBuyer = transaction.buyerID.toString() === "5af5d79cabaade2100a9cfea";
    console.log("isBuyer:", isBuyer);
    let transactionInfo = {};
    // console.log(transaction);
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
    transaction.save();
  })
});

router.post('/detail/:transactionID', function (req, res, next) {
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
    if (req.body.action === "Accept") {
      transaction.toAccepted();
    } else if (req.body.action === "Reject") {
      transaction.toRejected();
    } else if (req.body.action === "Sent") {
      transaction.toSent();
    } else if (req.body.action === "Complete") {
      transaction.toComplete();
    } else {

    }
    res.redirect("/transaction/detail/" + req.params.transactionID);
  });
});

module.exports = router;
