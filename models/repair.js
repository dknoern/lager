var mongoose = require('mongoose');

var Schema = new mongoose.Schema();

var RepairSchema = new mongoose.Schema({
    repairNumber: String,
    dateOut: Date,
    expectedReturnDate: Date,
    returnDate: Date,
    itemId: String,
    itemNumber: String,
    description: String,
    repairIssues: String,
    vendor: String,
    customerId: Number,
    customerFirstName: String,
    customerLastName: String,
    email: String,
    phone: String,
    repairNotes: String,
    hasPapers: Boolean,
    search: String
});

module.exports = mongoose.model('Repair', RepairSchema);
