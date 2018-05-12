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
};

transactionSchema.methods.toComplete = function () {
  // BUYER
  this.transactionStatus = "Complete";
  this.sellerIsRead = false;
  this.save();
};

let Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;