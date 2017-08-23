var mongoose = require('mongoose');

var Schema = new mongoose.Schema();

var CounterSchema = new mongoose.Schema({
    _id: {type: String, required: true},
    seq: {type: Number, default: 0}
});
var counter = mongoose.model('counter', CounterSchema);

var InvoiceSchema = new mongoose.Schema({
    customer: String,
    customerId: String,
    project: String,
    invoiceNumber: String,
    documentType: String,
    date: String,
    shipVia: String,
    paidBy: String,
    subtotal: String,
    tax: String,
    shipping: String,
    total: String,
    paymentId: String,
    salesPerson: String,
    invoiceType: String,
    shipToName: String,
    shipAddress1: String,
    shipAddress2: String,
    shipAddress3: String,
    shipCity: String,
    shipState: String,
    shipZip: String,

    lineItems: [{
        lineItemId: String,
        name: String,
        amount: Number
    }]
});

InvoiceSchema.pre('save', function (next) {
    var doc = this;

    if (doc.invoiceNumber==null) {
        counter.findByIdAndUpdate({_id: 'invoiceNumber'}, {$inc: {seq: 1}}, function (error, counter) {
            if (error)
                return next(error);
            doc.invoiceNumber = counter.seq;
            console.log("--------- invoiceNumberIs " + doc.invoiceNumber);

            next();
        });
    }else{
        next();
    }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
