var mongoose = require('mongoose');

var LineItemSchema = new mongoose.Schema({
    itemNumber: String,
    name: String,
    repairNumber: String,
    repairCost: Number,
    productId: String,
    repairId: String,
});

var LogSchema = new mongoose.Schema({
    date: Date,
    receivedFrom: String,
    comments: String,
    user: String,
    customerName: String,
    search: String,
    lineItems: {
        type: [LineItemSchema]
    }
});

module.exports = mongoose.model('Log', LogSchema);
