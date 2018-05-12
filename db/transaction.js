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
    enum: ["Created", "Accepted", "Rejected", "Sent", "Complete"],
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

transactionSchema.methods.toComplete = function () {
  // BUYER
  this.transactionStatus = "Complete";
// todo transactionStatus变成Complete时 bookStatus也变成Sold
  this.sellerIsRead
  this.save();
};

let Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;