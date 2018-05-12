let mongoose = require("mongoose");
let MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017";
const {ObjectId} = require('mongodb');


let transactionSchema = new mongoose.Schema({
  recordID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  buyerID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  sellerID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  addressID: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  buyerIsRead: {
    type: Boolean,
    required: true,
    default: true  // read
  },
  sellerIsRead: {
    type: Boolean,
    required: true,
    default: false  // unread
  },
  date: {
    type: Date,
    required: true,
    default: new Date()
  },
  transactionStatus: {
    type: String,
    required: true,
    enum: ["Created", "Accepted", "Rejected", "Sent", "Complete", "Cancelled"],
    default: "Created"
  }
});


transactionSchema.methods.toAccepted = function () {
  // SELLER
  this.transactionStatus = "Accepted";
  this.buyerIsRead = false;
  this.save();
};

transactionSchema.methods.toRejected = function () {
  // SELLER
  this.transactionStatus = "Rejected";
  this.buyerIsRead = false;
  this.save();
  MongoClient.connect(url, function (err, mongo) {
    if (err) throw err;
    let db = mongo.db("web");
    db.collection("book").updateOne({_id: ObjectId(this.recordID)}, {$set: {bookStatus: "Available"}}, function(err, result) {
      if (err) throw err;
    });
  });
};

transactionSchema.methods.toSent = function () {
  // SELLER
  this.transactionStatus = "Sent";
  this.buyerIsRead = false;
  this.save();
};

transactionSchema.methods.toCancelled = function (isBuyerInitiating) {
  this.transactionStatus = "Cancelled";
  if (isBuyerInitiating) {
    this.sellerIsRead = false;
  } else {
    this.buyerIsRead = false;
  }
  this.save();
  MongoClient.connect(url, function (err, mongo) {
    if (err) throw err;
    let db = mongo.db("web");
    db.collection("book").updateOne({_id: ObjectId(this.recordID)}, {$set: {bookStatus: "Available"}}, function(err, result) {
      if (err) throw err;
    });
  });
};

transactionSchema.methods.toComplete = function () {
  // BUYER
  this.transactionStatus = "Complete";
// todo transactionStatus变成Complete时 bookStatus也变成Sold
  MongoClient.connect(url, function (err, mongo) {
    if (err) throw err;
    let db = mongo.db("web");
    db.collection("book").updateOne({_id: ObjectId(this.recordID)}, {$set: {bookStatus: "Sold"}}, function(err, result) {
      if (err) throw err;
    });
  });
  this.sellerIsRead = false;
  this.save();
};

let Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;