var format = require('date-format');
var formatCurrency = require('format-currency');
var mongoose = require('mongoose');
var Counter = require('./counter');
var opts = { format: '%s%v', symbol: '$' };

var LineItemSchema = new mongoose.Schema({
    productId: String,
    itemNumber: String,
    name: String,
    amount: Number,
    serialNumber: String,
    longDesc: String
});

LineItemSchema.virtual('amountFMT').get(function () {
    return formatCurrency(this.amount, opts);
});

var InvoiceSchema = new mongoose.Schema({
  	_id: Number,
    customerId: Number,
    customerFirstName: String,
    customerLastName: String,
    customerEmail: String,
    project: String,
    returnNumber: String,
    documentType: String,
    date: Date,
    shipVia: String,
    paidBy: String,
    subtotal: Number,
    tax: Number,
    shipping: Number,
    total: Number,
    methodOfSale: String,
    salesPerson: String,
    invoiceType: String,
    shipToName: String,
    shipAddress1: String,
    shipAddress2: String,
    shipAddress3: String,
    shipCity: String,
    shipState: String,
    shipZip: String,
    shipCountry: String,
    billingAddress1: String,
    billingAddress2: String,
    billingAddress3: String,
    billingCity: String,
    billingState: String,
    billingZip: String,
    billingCountry: String,
    copyAddress: Boolean,
    search: String,
    taxExempt: Boolean,
    lineItems: {
  	    type: [LineItemSchema]
    }
});

InvoiceSchema.pre('save', function (next) {
    var doc = this;

    if (doc._id==null) {
        Counter.findByIdAndUpdate({_id: 'invoiceNumber'}, {$inc: {seq: 1}}, function (error, counter) {
            if (error)
                return next(error);
            doc._id = counter.seq;
            next();
        });
    }else{
        next();
    }
});

InvoiceSchema.virtual('dateFMT').get(function () {
    return format('MM/dd/yyyy', this.date);
});

InvoiceSchema.virtual('logo').get(function () {
    var type =  "invoice";
    if("memo" == this.invoiceType) type = "memo";
    return  "http://demesyinventory.com/assets/images/logo/" + type + "-logo.png";
});

InvoiceSchema.virtual('subtotalFMT').get(function () {
    return formatCurrency(this.subtotal, opts);
});

InvoiceSchema.virtual('taxFMT').get(function () {
    return formatCurrency(this.tax, opts);
});

InvoiceSchema.virtual('shippingFMT').get(function () {
    return formatCurrency(this.shipping, opts);
});

InvoiceSchema.virtual('totalFMT').get(function () {
    return formatCurrency(this.total, opts);
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
