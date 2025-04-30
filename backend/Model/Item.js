const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  desc: {
    type: String,
    required: false,
  },
  qty: {
    type: Number,
    required: true,
    default: 1,
  },
  uom: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  expDate: {
    type: Date,
    required: false,
  },
  purchasedDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  reorderLevel: {
    type: Number,
    required: true,
    default: 1,
  },
  usageRate: {
    type: Number,
    required: false,
    default: 0, // New field for average daily/weekly usage, default is 0
  },
  user_id: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Item", ItemSchema);
