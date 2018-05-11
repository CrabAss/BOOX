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
let mongoose = require("mongoose");
let router = express.Router();

/* GET home page. */



router.get('/list/buy', function(req, res, next) {
  transactionDB.find({buyerID: req.session.userID}, function (err, docs) {

  });
  res.render('transaction/list', { title: 'Express' });
});

router.get('/list/sell', function(req, res, next) {
  res.render('transaction/list', { title: 'Express' });
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
      console.log(transaction);
      res.render("transaction/detail", {detail: transaction});

  })
});

module.exports = router;
