var mongoose = require('mongoose');

var Schema = new mongoose.Schema();

var RepairSchema = new mongoose.Schema({
  _id: String,
  dateOut: Date,
  expectedReturnDate: Date,
  returnDate: Date,
  itemId: String,
  description: String,
  repairIssues: String,
  vendor: String,
  customerName: String,
  phone:String,
  email: String,
  itemNumber: String,
  repairNotes: String,
  productId: String,
  hasPapers: Boolean
});

module.exports = mongoose.model('Repair', RepairSchema);
