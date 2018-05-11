let mongoose = require("mongoose");

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
  readStatus: {
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
    enum: ["Created", "Accepted", "Rejected", "Sent", "Complete"],
    default: "Created"
  }
});


transactionSchema.methods.toAccepted = function () {
  // SELLER
  this.transactionStatus = "Accepted";
  this.readStatus = false;
};

transactionSchema.methods.toRejected = function () {
  // SELLER
  this.transactionStatus = "Rejected";
  this.readStatus = false;
};

transactionSchema.methods.toSent = function () {
  // SELLER
  this.transactionStatus = "Sent";
  this.readStatus = false;
};

transactionSchema.methods.toComplete = function () {
  // BUYER
  this.transactionStatus = "Complete";
// todo transactionStatus变成Complete时 bookStatus也变成Sold
  this.readStatus = false;
};

let Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;