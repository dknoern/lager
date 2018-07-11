var format = require('date-format');
var formatCurrency = require('format-currency');
var opts = { format: '%s%v', symbol: '$' };

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
    search: String,
    repairCost: Number
});



RepairSchema.virtual('dateOutFMT').get(function () {
    return format('MM/dd/yyyy', this.dateOut);
});

RepairSchema.virtual('repairCostFMT').get(function () {
    return formatCurrency(this.repairCost, opts);
});


module.exports = mongoose.model('Repair', RepairSchema);
