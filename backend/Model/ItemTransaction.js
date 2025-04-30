const mongoose = require('mongoose');

const itemTransactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  itemCode: {
    type: String,
    required: true,
  },

  
  action: {
    type: String,
    enum: ['increase', 'decrease'],
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ItemTransaction = mongoose.model('ItemTransaction', itemTransactionSchema);

module.exports = ItemTransaction;
