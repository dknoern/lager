var mongoose = require('mongoose');

var ProductSchema = new mongoose.Schema({
    //_id: String,
    itemNumber: String,
    productType: String,
    manufacturer: String,
    title: String,
    paymentAmount: Number,
    paymentMethod: String,
    paymentDetails: String,
    modelNumber: String,
    model: String,
    condition: String,
    gender: String,
    features: String,
    case: String,
    size: String,
    dial: String,
    bracelet: String,
    comments: String,
    serialNo: String,
    longDesc: String,
    lastUpdated: Date,
    cost: Number,
    listPrice: Number,
    totalRepairCost: Number,
    sellingPrice: Number,
    received: Date,
    status: String,
    notes: String,
    ebayNoReserve: Boolean,
    inventoryItem: Boolean,
    sellerType: String,
    seller: String,
    receivedFrom: String,
    customerName: String,
    receivedBy: String,
    customerName: String,
    search: String,
    history: [{
        user: String,
        date: Date,
        action: String
    }]
});

module.exports = mongoose.model('Product', ProductSchema);
