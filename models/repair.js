var mongoose = require('mongoose');

var Schema = new mongoose.Schema();

var RepairSchema = new mongoose.Schema({
  repairNumber: String,
  dateOut: Date,
  expectedReturnDate: Date,
  returnDate: Date,
  itemNo: String,
  description: String,
  repairIssues: String,
  vendor: String,
  customerName: String,
  phone:String,
  email: String,
  itemNumber: String,
  customerName: String,
  repairNotes: String,
  productId: String
});

module.exports = mongoose.model('Repair', RepairSchema);
