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



let Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;