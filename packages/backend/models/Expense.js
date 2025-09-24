
const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  comment: {
    type: String
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  attachment: {
    type: String
  },
  exported: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
