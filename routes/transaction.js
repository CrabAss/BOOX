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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
